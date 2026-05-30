# イベント編集機能 実装仕様書

## 概要

投稿済みの祭りイベントを編集できる機能を追加する。編集ページへのエントリポイントはアカウントページの「投稿した祭り」カードに設置する。

---

## 変更対象ファイル一覧

| ファイル | 種別 | 変更規模 |
|---------|------|---------|
| `backend/app/routers/festival_gallery.py` | 変更 | 小（DELETE エンドポイント追加） |
| `frontend/src/api/festivalGallery.ts` | 変更 | 小（削除関数追加） |
| `frontend/src/pages/EditFestivalPage.tsx` | 新規 | 大 |
| `frontend/src/App.tsx` | 変更 | 小（ルート追加） |
| `frontend/src/pages/AccountPage.tsx` | 変更 | 小（編集ボタン追加） |

---

## バックエンド変更

### `backend/app/routers/festival_gallery.py`

`DELETE /{photo_id}` エンドポイントを追加する。

- 認証必須（`get_current_user`）
- `festival_gallery` テーブルから該当レコードを取得し、`user_id` が現在のユーザーと一致するか確認（不一致なら 403）
- Supabase Storage から対象ファイルを削除（`storage_path` はURLから末尾のファイル名を取り出す）
- テーブルからレコードを削除
- レスポンス: 204 No Content

```python
@router.delete("/{photo_id}", status_code=204)
def delete_gallery_photo(
    photo_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    result = sb.table("festival_gallery").select("*").eq("id", photo_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Photo not found")
    row = result.data[0]
    if row["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    # Storage から削除（URLの末尾パスを取り出す）
    filename = row["filename"].split(f"/{BUCKET}/")[-1]
    sb.storage.from_(BUCKET).remove([filename])
    sb.table("festival_gallery").delete().eq("id", photo_id).execute()
```

---

## フロントエンド変更

### 1. `frontend/src/api/festivalGallery.ts`

`deleteFestivalGalleryPhoto` 関数を追加する。

```typescript
export const deleteFestivalGalleryPhoto = async (photoId: number): Promise<void> => {
    await apiClient.delete(`/festival-gallery/${photoId}`);
};
```

---

### 2. `frontend/src/pages/EditFestivalPage.tsx`（新規）

CMSPage をベースに、以下の差分を持つ編集ページを新設する。

#### ルートパラメータ
- `/cms/:id` でアクセス。`useParams<{ id: string }>()` で `id` を取得。

#### データ読み込み（useEffect）
- `fetchFestival(id)` → フォームの初期値をセット
- `fetchFestivalGallery(id)` → 既存ギャラリー写真をセット（`existingPhotos` state）
- ローディング中は「読み込み中...」表示

#### フォーム state
CMSPage と同じフィールドに加え、以下を追加:

| state | 型 | 用途 |
|-------|----|------|
| `existingPhotos` | `FestivalGalleryPhoto[]` | APIから取得した既存写真 |
| `deletedPhotoIds` | `Set<number>` | 削除対象の既存写真ID |
| `newPhotoFiles` | `File[]` | 新規追加ファイル |
| `newPhotoPreviews` | `string[]` | 新規追加のプレビューURL |
| `thumbnail` | `ThumbnailRef` | サムネイル選択状態 |

#### サムネイル選択の型

```typescript
type ThumbnailRef =
  | { kind: 'existing'; photoId: number }
  | { kind: 'new'; newIndex: number };
```

初期値: 既存写真が1枚以上あれば `{ kind: 'existing', photoId: existingPhotos[0].id }`、なければ `{ kind: 'new', newIndex: 0 }`。

#### 写真エリアのUI

既存写真と新規追加写真を1つのグリッドで並べて表示する。

- **既存写真**: `deletedPhotoIds` に含まれていなければ表示。削除マーク（×ボタン）をクリックすると `deletedPhotoIds` に追加（即座には削除せず保留）
- **新規写真**: CMSPage と同様のプレビュー・削除ボタン
- **サムネイル選択**: 両者共通で「サムネイルに設定」ボタンを表示
- **最大枚数**: `(表示中の既存写真数) + (新規写真数) <= MAX_PHOTOS (10)` で制限

#### 送信フロー（handleSubmit）

1. バリデーション（name・datetime）
2. `updateFestival(id, form)` — 祭り基本情報を更新
3. `deletedPhotoIds` に含まれる各 ID に対して `deleteFestivalGalleryPhoto(photoId)` を順次実行
4. 新規写真を `uploadFestivalGalleryPhoto` で順次アップロード（`order_index` は残存既存写真数 + 各新規のインデックス）
5. サムネイルURLを決定:
   - `thumbnail.kind === 'existing'` → 対応する `existingPhotos` の `filename`
   - `thumbnail.kind === 'new'` → アップロード結果の `filename`
   - サムネイルに指定した写真が削除された場合 → 残存先頭写真の `filename`（または `undefined` で thumbnail_url を空に）
6. `updateFestival(id, { ...form, thumbnail_url: thumbnailUrl })` でサムネイルを更新
7. `/festivals/:id` に遷移

#### ページタイトル・ボタン
- h1: 「祭り情報を編集」
- 送信ボタン: 「更新する」（submitting時は「更新中...」）

---

### 3. `frontend/src/App.tsx`

```tsx
import { EditFestivalPage } from './pages/EditFestivalPage';

// Routes に追加
<Route path="/cms/:id" element={<EditFestivalPage />} />
```

---

### 4. `frontend/src/pages/AccountPage.tsx`

「投稿した祭り」カードに「編集」ボタンを追加する。

- カード全体クリック → `/festivals/:id`（詳細ページ、既存の挙動）
- カード右上に「編集」ボタンを追加 → `/cms/:id` に遷移
- ボタンクリックは `e.stopPropagation()` でカード全体のクリックと競合しないようにする

```tsx
// カード内の右上に配置
<button
  onClick={(e) => { e.stopPropagation(); navigate(`/cms/${f.id}`); }}
  style={{
    fontSize: '11px', fontWeight: 600, padding: '4px 10px',
    background: 'white', color: '#4a6840', border: '1px solid #c8d8be',
    borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-body)',
  }}
>
  編集
</button>
```

---

## 変更しないもの

- `CMSPage.tsx`（投稿ページ）— 既存の挙動・UIは一切変更しない
- `festival_gallery` の GET / POST エンドポイント
- `festivals` テーブルのスキーマ（変更不要）
- 他ページ（MapPage, FestivalDetailPage 等）
