# CLAUDE.md

# プロジェクト概要
お祭りの情報をCMSで投稿し，地図UIから参加者を募るWebアプリ。

## ディレクトリ構成
| ディレクトリ | 役割 |
|-------------|------|
| src/pages/ | ページコンポーネント（ルーティング単位） |
| src/components/ | 再利用可能なUIコンポーネント |
| src/hooks/ | カスタムフック（ビジネスロジック） |
| src/api/ | FastAPIとのREST通信ロジック |
| src/types/ | TypeScript型定義 |
| src/utils/ | 汎用ユーティリティ |

## 技術スタック

### フロントエンド
- React 19.2.4
- TypeScript 5 (strictモード)
- Tailwind CSS
- Vite
- Vitest

### バックエンド
- FastAPI（Python）
- REST API
- JWT認証

## 設計原則
- TypeScript strictモード: `any`禁止、型定義は必須
- Custom Hooks: ビジネスロジックとUIを完全分離
- API層の分離: `src/api/`配下に集約し、コンポーネントから直接fetchしない
- 認証: JWTトークンをlocalStorageで管理、`src/api/`でAxiosインターセプターを使用

## コーディング規約
- インデント: `.tsx`は2スペース、それ以外（`.ts`, `.py`等）は4スペース
- シングルクォート優先
- セミコロンあり
- propsの型定義は必須（interfaceで定義）

### 典型的なコンポーネントパターン
```tsx
interface FestivalCardProps {
  id: string;
  name: string;
  region: string;
  onClick: (id: string) => void;
}

export function FestivalCard({ id, name, region, onClick }: FestivalCardProps) {
  return (
    <div className="..." onClick={() => onClick(id)}>
      <h2>{name}</h2>
      <p>{region}</p>
    </div>
  );
};

```

### 典型的なAPIコールパターン
```ts
// src/api/festivals.ts
import { apiClient } from './client';
import { Festival } from '../types/festival';

export const fetchFestivals = async (): Promise<Festival[]> => {
    const response = await apiClient.get<Festival[]>('/festivals');
    return response.data;
};
```

### 典型的なカスタムフックパターン
```ts
// src/hooks/useFestivals.ts
import { useState, useEffect } from 'react';
import { fetchFestivals } from '../api/festivals';
import { Festival } from '../types/festival';

const useFestivals = () => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFestivals()
            .then(setFestivals)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return { festivals, loading, error };
};

export default useFestivals;
```

## 認証フロー
- ログイン成功時: JWTをlocalStorageに保存
- `src/api/client.ts`のAxiosインスタンスにインターセプターでAuthorizationヘッダーを自動付与
- 401レスポンス時: ログインページへリダイレクト

## 禁止事項
- `any`型の使用
- コンポーネント内での直接fetch（必ず`src/api/`経由）
- `useEffect`内でのasync関数の直接定義（別関数に切り出す）
- propsの型定義省略

## よく使うコマンド

### フロントエンド
| コマンド | 説明 |
|---------|------|
| `pnpm run dev` | 開発サーバー起動 |
| `pnpm test` | テスト実行 |
| `pnpm run lint` | ESLint実行 |
| `pnpm run build` | 本番ビルド |

### バックエンド
| コマンド | 説明 |
|---------|------|
| `activate` | 仮想環境の起動 |
| `deactivate` | 仮想環境の終了 |
| `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | 開発サーバー起動 |