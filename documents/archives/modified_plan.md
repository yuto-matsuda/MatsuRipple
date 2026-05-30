# MatsuRipple 追加機能 実装案

---

## 1. 祭り検索結果を近い時間順でソート

### 概要
マップページの祭りリストを、現在時刻に最も近い開催日時順に並び替える。

### バックエンド
- `GET /festivals/` のレスポンスを `start_datetime` 昇順でソートするか、クエリパラメータ `?sort=date` を追加
- 現在日時以降の祭りを優先（過去の祭りは末尾）

### フロントエンド
- `useFestivals` フック内でフェッチ後にクライアントソート
  - `start_datetime` が null の祭りは末尾に
  - 現在日時以降の祭りを昇順で表示
  - 過去の祭りはデフォルト非表示。UI のトグルで表示/非表示を切り替え可能

### 変更ファイル
| ファイル | 変更内容 |
|---|---|
| `frontend/src/hooks/useFestivals.ts` | フェッチ後にソートロジック追加 |
| `backend/app/routers/festivals.py` | `order("start_datetime")` に変更（オプション） |

---

## 2. 祭り詳細欄に開催場所の地図を表示

### 概要
祭り詳細ページ（FestivalDetailPage）に、開催場所の地図を埋め込む。

### 実装方針
- `festival.location_lat` / `location_lng` が存在する場合のみ表示
- 既存の `MapContainer`（react-leaflet）を小さいサイズで埋め込む
- ピン1本 + ズームレベル 14 で固定表示

### 変更ファイル
| ファイル | 変更内容 |
|---|---|
| `frontend/src/pages/FestivalDetailPage.tsx` | 地図セクション追加（MapContainer + Marker） |

---

## 3. 参加者のみ口コミを投稿でき、一般ユーザーは閲覧のみ

### 概要
- 祭りに参加登録済みのユーザー → 口コミ（レビュー）を投稿できる
- 未参加・未ログインユーザー → 口コミの閲覧のみ

### DB
```sql
CREATE TABLE reviews (
  id          BIGSERIAL PRIMARY KEY,
  festival_id BIGINT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(festival_id, user_id)  -- 1ユーザー1口コミ
);
```

### バックエンド
| エンドポイント | 説明 |
|---|---|
| `GET /reviews/?festival_id=X` | 口コミ一覧（認証不要） |
| `POST /reviews/` | 口コミ投稿（要認証・参加済みチェック） |

- `POST` 時に `participants` テーブルで `festival_id + email` の存在確認

### フロントエンド
| ファイル | 変更内容 |
|---|---|
| `backend/app/schemas.py` | `ReviewCreate`, `ReviewResponse` 追加 |
| `backend/app/routers/reviews.py` | 新規作成 |
| `backend/app/main.py` | `/reviews` ルーター登録 |
| `frontend/src/types/review.ts` | 型定義 |
| `frontend/src/api/reviews.ts` | `fetchReviews`, `postReview` |
| `frontend/src/hooks/useReviews.ts` | カスタムフック |
| `frontend/src/pages/FestivalDetailPage.tsx` | 口コミセクション追加 |

---

## 4. 祭り詳細欄に追加情報フィールド

### 概要
以下のフィールドを祭りに追加し、CMSページで入力できるようにする。

| フィールド | 型 | NULL許容 | 説明 |
|---|---|---|---|
| `fee` | `TEXT` | ✗ | 料金（例：「無料」「大人500円」） |
| `official_url` | `TEXT` | ✓ | 公式サイト URL |
| `bad_weather` | `TEXT` | ✓ | 悪天時対応（例：「中止」「屋内移動」） |
| `parking` | `BOOLEAN` | ✗ | 駐車場の有無 |

### DB
```sql
ALTER TABLE festivals
  ADD COLUMN fee          TEXT,
  ADD COLUMN official_url TEXT,          -- nullable
  ADD COLUMN bad_weather  TEXT,          -- nullable
  ADD COLUMN parking      BOOLEAN DEFAULT FALSE;
```

### バックエンド
| ファイル | 変更内容 |
|---|---|
| `backend/app/schemas.py` | `FestivalCreate` / `FestivalResponse` に5フィールド追加 |
| `backend/app/routers/festivals.py` | 特になし（汎用 insert/update のため自動対応） |

### フロントエンド
| ファイル | 変更内容 |
|---|---|
| `frontend/src/types/festival.ts` | 5フィールド追加 |
| `frontend/src/pages/CMSPage.tsx` | 入力欄4つ追加（料金・公式URL・悪天対応・駐車場） |
| `frontend/src/pages/EditFestivalPage.tsx` | 同上 |
| `frontend/src/pages/FestivalDetailPage.tsx` | 詳細表示セクションに追加情報を表示 |

---

## 実装優先順位（提案）

| 優先度 | 機能 | 工数感 |
|---|---|---|
| 高 | 4. 詳細フィールド追加 | 小（DB + スキーマ + UI） |
| 高 | 1. 時間順ソート | 極小（フロントのみ） |
| 中 | 2. 詳細ページに地図 | 小（既存コンポーネント流用） |
| 低 | 3. 口コミ機能 | 大（DB・API・UI 新規） |
