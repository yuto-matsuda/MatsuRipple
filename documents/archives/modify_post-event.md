# 祭り投稿機能 追加変更設計書

仕様元: `docs/features/post_event/document_ver2.md`

## 概要

祭り投稿フォーム（CMSPage）にトピック写真の添付とサムネイル指定を追加する。
表示側（FestivalDetailPage）にはスワイプ形式のフォトギャラリーとモーダル拡大表示を追加する。

**制約：既存の機能・UIの変更は禁止。機能の追加のみ。**

---

## 追加機能の整理

| 機能 | 場所 | 概要 |
|------|------|------|
| トピック写真添付 | CMSPage | 投稿フォームから最大10枚選択・プレビュー |
| サムネイル指定 | CMSPage | 添付写真から1枚を選択（デフォルト1枚目） |
| スワイプギャラリー | FestivalDetailPage | トピック写真を横スワイプで閲覧 |
| モーダル拡大表示 | FestivalDetailPage | 写真タップで全画面モーダル、×・背景クリックでクローズ |

### テーブルによる写真の区別

フラグによる区別ではなく、用途ごとにテーブルを分ける。

| テーブル | 用途 | Storage バケット |
|---------|------|----------------|
| `photos`（既存・変更なし） | FestivalDetailPage からユーザーが後から追加する写真 | `photos`（既存） |
| `festival_gallery`（新規） | CMSPage 投稿時に添付するトピック写真 | `festival-gallery`（新規） |

既存の `photos` テーブル・ルーター・フロントエンドコードは**一切変更しない**。

---

## 1. Supabase 側の変更（SQL Editor で実行）

```sql
-- festivals にサムネイル URL を追加
ALTER TABLE festivals ADD COLUMN thumbnail_url TEXT;

-- トピック写真用の新規テーブル
CREATE TABLE festival_gallery (
    id          SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    filename    TEXT NOT NULL,        -- Supabase Storage の公開URL
    original_name VARCHAR,
    order_index INTEGER NOT NULL DEFAULT 0,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_festival_gallery_festival_id ON festival_gallery(festival_id);
```

**Storage バケット作成**：Supabase ダッシュボード → Storage → New bucket

| 項目 | 設定値 |
|------|--------|
| Name | `festival-gallery` |
| Public bucket | ✅ ON |

Storage ポリシー（SQL Editor）:

```sql
CREATE POLICY "Public read festival-gallery"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'festival-gallery');

CREATE POLICY "Authenticated upload festival-gallery"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'festival-gallery');
```

---

## 2. バックエンドの変更内容

### 2-1. `app/schemas.py`

`FestivalCreate`・`FestivalResponse` に `thumbnail_url` を追加する。
`FestivalGalleryPhoto` レスポンス型を新規追加する。

```diff
 class FestivalCreate(BaseModel):
     name: str
     ...
+    thumbnail_url: Optional[str] = None

 class FestivalResponse(BaseModel):
     ...
+    thumbnail_url: Optional[str] = None
     created_at: datetime
```

```python
# 新規追加
class FestivalGalleryPhotoResponse(BaseModel):
    id: int
    festival_id: int
    filename: str
    original_name: Optional[str] = None
    order_index: int
    user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
```

### 2-2. `app/routers/festival_gallery.py`（新規作成）

`festival_gallery` テーブルと `festival-gallery` バケットを操作する専用ルーター。

```python
BUCKET = "festival-gallery"

# POST /festival-gallery/  → 写真アップロード（認証必須）
# GET  /festival-gallery/?festival_id=X  → 一覧取得（公開）
```

`POST` の処理フロー：
1. Supabase Storage `festival-gallery` バケットにアップロード
2. 公開 URL を取得
3. `festival_gallery` テーブルに INSERT（`festival_id`, `filename`, `original_name`, `order_index`, `user_id`）

### 2-3. `app/main.py`

新ルーターをマウントする。

```diff
+from .routers import festival_gallery
+app.include_router(festival_gallery.router, prefix="/festival-gallery", tags=["festival-gallery"])
```

### 2-4. `app/routers/festivals.py`（変更なし）

`thumbnail_url` は `FestivalCreate` に含まれるため、既存の `PUT /festivals/{id}` で更新可能。変更不要。

---

## 3. フロントエンドの変更内容

### 3-1. `frontend/src/types/festival.ts`

```diff
 export interface Festival {
     ...
+    thumbnail_url: string | null;
 }

 export interface FestivalCreate {
     ...
+    thumbnail_url?: string;
 }
```

### 3-2. `frontend/src/types/festivalGallery.ts`（新規作成）

```typescript
export interface FestivalGalleryPhoto {
    id: number;
    festival_id: number;
    filename: string;
    original_name: string | null;
    order_index: number;
    user_id: number | null;
    created_at: string;
}
```

### 3-3. `frontend/src/api/festivalGallery.ts`（新規作成）

```typescript
// GET /festival-gallery/?festival_id=X
export const fetchFestivalGallery = async (festivalId: number): Promise<FestivalGalleryPhoto[]>

// POST /festival-gallery/  (multipart/form-data)
export const uploadFestivalGalleryPhoto = async (
    file: File,
    festivalId: number,
    orderIndex: number,
): Promise<FestivalGalleryPhoto>
```

### 3-4. `frontend/src/pages/CMSPage.tsx`（追加のみ）

既存フォームの「説明文」セクションの下に「トピック写真」セクションを新設する。

**追加するUI要素：**
- 写真選択ボタン（`<input type="file" multiple accept="image/*">`）
- 選択済み写真のプレビューグリッド（最大10枚）
- 各写真に「サムネイルに設定」ボタン（選択中は強調表示）
- 各写真に削除ボタン

**送信フロー（`handleSubmit` を拡張）：**
```
1. POST /festivals/          → festival.id を取得
2. for each photo (順番付き):
     POST /festival-gallery/ (festival_id=id, order_index=i)
     → FestivalGalleryPhoto.filename を取得
3. PUT /festivals/{id}       → thumbnail_url = gallery[thumbnailIndex].filename
4. navigate(`/festivals/${festival.id}`)
```

**バリデーション追加：**
- 写真は最大10枚（11枚目選択時にエラー表示）
- サムネイルが未選択の場合は1枚目を自動設定

### 3-5. `frontend/src/components/PhotoSwiper.tsx`（新規作成）

トピック写真をスワイプ表示するコンポーネント。

```
Props:
  photos: FestivalGalleryPhoto[]

表示仕様:
  - 横方向 CSS scroll-snap（scroll-snap-type: x mandatory）
  - 各スライド: 画像 + ページインジケーター（●○○）
  - タップで PhotoLightbox を開く（initialIndex を渡す）
```

### 3-6. `frontend/src/components/PhotoLightbox.tsx`（新規作成）

写真モーダル拡大表示コンポーネント。

```
Props:
  photos: FestivalGalleryPhoto[]
  initialIndex: number
  onClose: () => void

表示仕様:
  - position: fixed、inset: 0、background: rgba(0,0,0,0.85)
  - 中央に max-w: 90vw / max-h: 90vh で画像表示
  - 右上に × ボタン（クリックで onClose）
  - 背景クリックで onClose
  - 左右の < > ナビゲーションボタンで複数枚を切り替え
```

### 3-7. `frontend/src/pages/FestivalDetailPage.tsx`（追加のみ）

既存セクション（説明文・参加登録・写真）の**前**に以下を追加する。

1. **サムネイル Hero 画像**：`festival.thumbnail_url` が存在する場合、現在のグラデーション背景の上に `object-fit: cover` の画像を重ねて表示する。
2. **スワイプギャラリーセクション**：`fetchFestivalGallery(festivalId)` で取得した写真を `PhotoSwiper` に渡す。

---

## 変更ファイル一覧

| ファイル | 変更種別 |
|---------|---------|
| Supabase SQL | `festivals.thumbnail_url` 追加、`festival_gallery` テーブル新規作成 |
| Supabase Storage | `festival-gallery` バケット新規作成 |
| `backend/app/schemas.py` | `thumbnail_url` 追加、`FestivalGalleryPhotoResponse` 新規追加 |
| `backend/app/routers/festival_gallery.py` | 新規作成 |
| `backend/app/main.py` | 新ルーターをマウント |
| `frontend/src/types/festival.ts` | `thumbnail_url` 追加 |
| `frontend/src/types/festivalGallery.ts` | 新規作成 |
| `frontend/src/api/festivalGallery.ts` | 新規作成 |
| `frontend/src/pages/CMSPage.tsx` | トピック写真セクション追加、送信フロー拡張 |
| `frontend/src/components/PhotoSwiper.tsx` | 新規作成 |
| `frontend/src/components/PhotoLightbox.tsx` | 新規作成 |
| `frontend/src/pages/FestivalDetailPage.tsx` | サムネイル Hero・スワイプギャラリー追加 |

**変更なし：** `photos` テーブル・`app/routers/photos.py`・`frontend/src/types/photo.ts`・`frontend/src/api/photos.ts`・`frontend/src/hooks/usePhotos.ts`
