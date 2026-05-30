# ユーザー・データ紐付け設計書

## 概要

現在、祭り情報（`festivals`）・写真（`photos`）は「誰が作成したか」を記録していない。
本変更では各テーブルに `user_id` を追加し、作成者との紐付けを実現する。
これにより AccountPage での「自分の投稿履歴」表示と、編集・削除の権限制御が可能になる。

---

## 対象データと設計方針

| テーブル | 変更内容 | 備考 |
|---------|---------|------|
| `festivals` | `user_id` 列を追加 | 投稿者を記録 |
| `photos` | `user_id` 列を追加 | アップロード者を記録 |
| `participants` | 変更なし | 一般ユーザー（非アカウント）の登録のため不要 |

---

## 1. Supabase 側の変更（SQL Editor で実行）

```sql
-- festivals に user_id を追加
ALTER TABLE festivals
    ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- photos に user_id を追加
ALTER TABLE photos
    ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- インデックス
CREATE INDEX idx_festivals_user_id ON festivals(user_id);
CREATE INDEX idx_photos_user_id ON photos(user_id);
```

> 既存データは `user_id = NULL` になる。nullable にするため後方互換あり。

---

## 2. バックエンドの変更内容

### 2-1. `app/schemas.py`

`FestivalResponse` と `PhotoResponse` に `user_id` を追加する。

```diff
 class FestivalResponse(BaseModel):
     id: int
     name: str
     ...
+    user_id: Optional[int] = None
     created_at: datetime
```

```diff
 class PhotoResponse(BaseModel):
     id: int
     ...
+    user_id: Optional[int] = None
     created_at: datetime
```

### 2-2. `app/routers/festivals.py`

`create_festival` で `user_id` を保存する。
`PUT` / `DELETE` でオーナー確認を追加する（自分の投稿のみ編集・削除可）。

```python
# POST /festivals/
def create_festival(festival: schemas.FestivalCreate, current_user=Depends(get_current_user)):
    data = {..., "user_id": current_user.id}

# PUT /festivals/{id}
def update_festival(festival_id, festival, current_user=Depends(get_current_user)):
    existing = sb.table("festivals").select("user_id").eq("id", festival_id)...
    if existing["user_id"] != current_user.id:
        raise HTTPException(403, "Forbidden")

# DELETE /festivals/{id}
def delete_festival(festival_id, current_user=Depends(get_current_user)):
    # 同上のオーナーチェック
```

また、**自分の投稿一覧**エンドポイントを追加する。

```python
# GET /festivals/me  ← 新規追加
def list_my_festivals(current_user=Depends(get_current_user)):
    return sb.table("festivals").select("*").eq("user_id", current_user.id)...
```

### 2-3. `app/routers/photos.py`

`upload_photo` で `user_id` を保存する。
自分のアップロード一覧エンドポイントを追加する。

```python
# POST /photos/  に追加
data = {..., "user_id": current_user.id}

# GET /photos/me  ← 新規追加
def list_my_photos(current_user=Depends(get_current_user)):
    return sb.table("photos").select("*").eq("user_id", current_user.id)...
```

---

## 3. フロントエンドの変更内容

### 3-1. `frontend/src/types/festival.ts`

```diff
 export interface Festival {
     ...
+    user_id: number | null;
 }
```

### 3-2. `frontend/src/types/photo.ts`

```diff
 export interface Photo {
     ...
+    user_id: number | null;
 }
```

### 3-3. `frontend/src/api/festivals.ts`（追加）

```ts
export const fetchMyFestivals = async (): Promise<Festival[]> => {
    const response = await apiClient.get<Festival[]>('/festivals/me');
    return response.data;
};
```

### 3-4. `frontend/src/api/photos.ts`（追加）

```ts
export const fetchMyPhotos = async (): Promise<Photo[]> => {
    const response = await apiClient.get<Photo[]>('/photos/me');
    return response.data;
};
```

### 3-5. `frontend/src/hooks/useUserHistory.ts`（新規作成）

```ts
const useUserHistory = () => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchMyFestivals(), fetchMyPhotos()])
            .then(([f, p]) => { setFestivals(f); setPhotos(p); })
            .finally(() => setLoading(false));
    }, []);

    return { festivals, photos, loading };
};
```

### 3-6. `frontend/src/pages/AccountPage.tsx`（更新）

現在は「退会」ボタンのみ。以下を追加する。

- **「自分の投稿」セクション** — `useUserHistory` を使い、投稿した祭り一覧を `FestivalCard` で表示
- **「自分の写真」セクション** — アップロードした写真を `PhotoGallery` で表示

---

## 変更ファイル一覧

| ファイル | 変更種別 |
|---------|---------|
| Supabase SQL Editor | `ALTER TABLE` 2件 + `CREATE INDEX` 2件 |
| `backend/app/schemas.py` | `FestivalResponse`・`PhotoResponse` に `user_id` 追加 |
| `backend/app/routers/festivals.py` | `create_festival` に `user_id` 保存、`/me` エンドポイント追加、PUT/DELETE にオーナーチェック追加 |
| `backend/app/routers/photos.py` | `upload_photo` に `user_id` 保存、`/me` エンドポイント追加 |
| `frontend/src/types/festival.ts` | `user_id` フィールド追加 |
| `frontend/src/types/photo.ts` | `user_id` フィールド追加 |
| `frontend/src/api/festivals.ts` | `fetchMyFestivals()` 追加 |
| `frontend/src/api/photos.ts` | `fetchMyPhotos()` 追加 |
| `frontend/src/hooks/useUserHistory.ts` | 新規作成 |
| `frontend/src/pages/AccountPage.tsx` | 投稿・写真履歴セクション追加 |
