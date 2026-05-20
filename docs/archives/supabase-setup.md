# Supabase 移行セットアップ

## 概要

| 種別 | 移行前 | 移行後 |
|------|--------|--------|
| DB | SQLite（`backend/matsuripple.db`） | Supabase PostgreSQL |
| 画像ファイル | `backend/uploads/` にローカル保存 | Supabase Storage（`photos` バケット） |
| 画像URL | `/uploads/{filename}` | Supabase Storage の公開URL |

---

## 1. Supabase 側の設定

### 1-1. テーブル作成（SQL Editor で実行）

Supabase ダッシュボード → **SQL Editor** に以下を貼り付けて実行する。

```sql
-- users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL
);

-- festivals
CREATE TABLE festivals (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    region VARCHAR,
    location_lat FLOAT,
    location_lng FLOAT,
    start_datetime VARCHAR,
    end_datetime VARCHAR,
    venue VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- participants
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- photos
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER REFERENCES festivals(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,   -- Supabase Storage の公開URL を格納する
    original_name VARCHAR,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_participants_festival_id ON participants(festival_id);
CREATE INDEX idx_photos_festival_id ON photos(festival_id);
```

> SQLAlchemy の `Base.metadata.create_all()` は PostgreSQL 接続後に自動実行されるため、
> 上記 SQL の代わりにアプリ起動時に自動作成させることも可能。
> ただし、明示的に SQL を実行しておく方がスキーマを管理しやすい。

### 1-2. 管理ユーザーの追加

テーブル作成後、以下で admin ユーザーを挿入する（パスワードは Python で生成）。

```sql
-- ハッシュ値は Python で生成する（下記コマンドで取得してから貼り付ける）
-- cd backend && source env/bin/activate
-- python -c "from app.auth import hash_password; print(hash_password('admin1234'))"
INSERT INTO users (username, email, hashed_password)
VALUES ('admin', 'admin@matsuripple.local', '<上記コマンドの出力値>');
```

### 1-3. Storage バケットの作成

Supabase ダッシュボード → **Storage** → **New bucket**

| 項目 | 設定値 |
|------|--------|
| Name | `photos` |
| Public bucket | ✅ ON |

バケット作成後、**SQL Editor** で以下を実行してアップロードポリシーを設定する。

```sql
-- 認証ユーザーのみアップロード可
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- 公開読み取り
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- 認証ユーザーのみ削除可
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
```

> **注意:** バックエンドから Supabase Storage にアップロードする際は
> `service_role` キーを使用するため、上記 RLS ポリシーはフロントエンドから
> 直接アップロードする場合に有効。バックエンド経由（現構成）では
> `service_role` キーが RLS をバイパスするため問題なし。

---

## 2. 環境変数の設定

`backend/.env`（新規作成、`.gitignore` に追記済みであること）

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=[service_role キー]
```

> - `DATABASE_URL` は Supabase ダッシュボード → **Settings → Database → Connection string → URI（Transaction mode）** から取得。
> - `SUPABASE_URL` と `SUPABASE_SERVICE_KEY` は **Settings → API** から取得。
> - Transaction mode（ポート 6543）は Connection Pooler 経由で接続するため、
>   サーバーレス環境での接続数超過を防げる。ローカル開発では Session mode（ポート 5432）でも可。

---

## 3. バックエンドの変更内容

### 3-1. `requirements.txt`

```diff
+ psycopg2-binary>=2.9
+ python-dotenv>=1.0
+ supabase>=2.0
- aiofiles>=23.0   # Supabase Storage SDK に置き換えるため不要
```

### 3-2. `backend/app/database.py`

```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

# Transaction mode pooler は prepared statements 非対応のため無効化
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3-3. `backend/app/routers/photos.py`

ローカルファイル保存を廃止し、Supabase Storage SDK でアップロードする。
`filename` カラムに Supabase Storage の公開 URL を格納する。

```python
import os, uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from supabase import create_client, Client
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

def _supabase() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)

BUCKET = "photos"


@router.post("/", response_model=schemas.PhotoResponse, status_code=201)
async def upload_photo(
    file: UploadFile = File(...),
    festival_id: Optional[int] = Form(None),
    is_public: bool = Form(True),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image files only")
    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    storage_path = f"{uuid.uuid4()}{ext}"
    content = await file.read()

    sb = _supabase()
    sb.storage.from_(BUCKET).upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type},
    )
    public_url: str = sb.storage.from_(BUCKET).get_public_url(storage_path)

    db_photo = models.Photo(
        festival_id=festival_id,
        filename=public_url,   # URL を格納
        original_name=file.filename,
        is_public=is_public,
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo


@router.get("/", response_model=List[schemas.PhotoResponse])
def list_photos(festival_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Photo).filter(models.Photo.is_public == True)
    if festival_id is not None:
        query = query.filter(models.Photo.festival_id == festival_id)
    return query.order_by(models.Photo.created_at.desc()).all()
```

### 3-4. `backend/app/main.py`

`/uploads` の静的ファイルマウントを削除する。

```diff
- import os
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
- from fastapi.staticfiles import StaticFiles
  ...
- os.makedirs("uploads", exist_ok=True)
  ...
- app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

---

## 4. フロントエンドの変更内容

### 4-1. `frontend/src/components/PhotoGallery.tsx`

`filename` が Supabase Storage の公開 URL になるため、パスのプレフィックスを除去する。

```diff
- href={`/uploads/${photo.filename}`}
+ href={photo.filename}
  ...
- src={`/uploads/${photo.filename}`}
+ src={photo.filename}
```

---

## 5. `.gitignore` の確認

`backend/.env` がコミットされないよう `.gitignore` に追記する。

```gitignore
# backend
backend/.env
backend/matsuripple.db
backend/uploads/
```

---

## 6. 既存データの移行手順

現在 `backend/matsuripple.db` と `backend/uploads/` にあるデータを移行する場合：

1. Supabase にテーブルを作成する（手順 1-1）
2. `backend/.env` を作成して接続情報を設定する（手順 2）
3. バックエンドの依存パッケージを更新・インストールする
4. `uploads/` 内の画像ファイルを Supabase Storage の `photos` バケットに手動アップロードし、`photos` テーブルの `filename` カラムを公開 URL に更新する
5. SQLite の各テーブルのデータを CSV エクスポートし、Supabase の Table Editor でインポートする（または INSERT 文を生成）

---

## 実装対象ファイル一覧

| ファイル | 変更種別 |
|---------|---------|
| `backend/requirements.txt` | 更新 |
| `backend/.env` | 新規作成 |
| `backend/app/database.py` | 更新 |
| `backend/app/routers/photos.py` | 更新 |
| `backend/app/main.py` | 更新 |
| `frontend/src/components/PhotoGallery.tsx` | 更新 |
| `.gitignore` | 確認・追記 |
