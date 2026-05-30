# モバイルUI修正仕様書

## 変更概要

| # | 対象 | 変更内容 |
|---|------|---------|
| 1 | `Navbar.tsx` | ハンバーガーメニューをドロップダウン → 左スライドドロワーに変更 |
| 2 | `MapPage.tsx` | 地図/リスト切り替えタブを廃止し、右下 FAB + 右スライドパネルに変更 |

デスクトップ（md:）のレイアウトは**一切変更しない**。

---

## 1. Navbar — 左スライドドロワー

### 現状
ハンバーガーボタンをタップすると、ナビバーの直下にドロップダウンが展開される。

### 変更後

```
┌──────────────────────┐
│ 🌀 MatsuRipple  [≡] │  ← Navbar（変更なし）
└──────────────────────┘
┌──────────────┐░░░░░░░
│ [×]          │░░░░░░░  ← 左ドロワー（幅80% / max 300px）
│              │░░░░░░░
│ ⬤ ユーザー名 │░░░░░░░  ← アカウントセクション
│   メールアドレス│░░░░░░░
│──────────────│░░░░░░░
│ 🗺 地図      │░░░░░░░
│ 📷 写真      │░░░░░░░
│ 📝 祭り投稿  │░░░░░░░
│ 👥 グループ  │░░░░░░░
│──────────────│░░░░░░░
│ アカウント   │░░░░░░░
│ ログアウト   │░░░░░░░
└──────────────┘░░░░░░░
 ░░░  ← バックドロップ（タップで閉じる）
```

### 実装詳細

#### アカウントセクション
Navbar で `fetchMe()` を呼び出してユーザー情報を取得する。

```ts
const [user, setUser] = useState<{ username: string; email: string } | null>(null);

useEffect(() => {
  if (!isAuthenticated) return;
  fetchMe().then(setUser).catch(() => {});
}, [isAuthenticated]);
```

ドロワー上部に表示：
- **アバター**: `username` の先頭1文字を大文字で表示した円形バッジ（`background: linear-gradient(135deg, #4e8b3f, #2d5422)`、`color: white`、直径56px）
- **ユーザー名**: `username`（14px、bold、`#1c2e17`）
- **メール**: `email`（12px、`#7a9470`）
- 未ログイン時: 人アイコン（`UserCircle` from lucide-react）＋「ゲスト」表示

#### ドロワー本体のスタイル
```
position: fixed
top: 0
left: 0
bottom: 0
width: min(80vw, 300px)
background: white
z-index: 300
box-shadow: 4px 0 24px rgba(0,0,0,0.18)
transition: transform 0.28s ease
transform: translateX(0) or translateX(-100%)
```

ドロワー内のナビリンクは白背景に緑系テキスト（`#1c2e17`）で、アクティブ時は左に `3px solid #c85a2c` のボーダー＋ `#f4f7f0` 背景。

#### バックドロップ
```
position: fixed, inset: 0
background: rgba(0,0,0,0.4)
z-index: 200
transition: opacity 0.28s ease
```
タップで `menuOpen = false`。

#### アニメーション（Tailwind）
```tsx
// ドロワー
<div className={`fixed top-0 left-0 bottom-0 w-[min(80vw,300px)] bg-white z-[300] shadow-xl
  transition-transform duration-[280ms] ease-in-out
  ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
```

常にDOMに存在させ、`translate-x-0` / `-translate-x-full` で表示を切り替える（`{menuOpen && ...}` の条件レンダリングではなく）。これによりスライドアニメーションが機能する。

#### 外クリック・ルート変更での閉じ処理
現行と同様に `useEffect` でバックドロップクリックを検知、`location.pathname` 変更時に閉じる。

---

## 2. MapPage — FAB ＋ 右スライドパネル

### 現状
画面上部に「🗺 地図 / 📋 リスト」タブバーがあり、切り替えで表示を変える。

### 変更後

```
┌─────────────────────────┐
│      地図（全画面）       │  ← MapView が常に表示
│                         │
│                         │     ┌──────────────┐
│                         │     │ [×]          │
│                         │     │ 🔍 検索欄    │
│                         │     │ ─────────── │
│                         │     │ [祭りカード]  │
│                         │     │ [祭りカード]  │
│                    [📋] │     │ [祭りカード]  │
└─────────────────────────┘     └──────────────┘
  ↑ FAB（右下固定）               ↑ 右スライドパネル（幅85% / max 320px）
```

### 実装詳細

#### タブバーの削除
- `mobileTab` state を削除
- モバイルタブバーの JSX（`md:hidden` の div）を削除
- サイドバーの表示制御: モバイルでは `hidden md:flex`（常に非表示）、デスクトップは現行通り

#### FAB（Floating Action Button）
```
position: fixed
bottom: 24px
right: 24px
width: 56px / height: 56px
border-radius: 50%
background: #c85a2c
color: white
box-shadow: 0 4px 16px rgba(200,90,44,0.4)
z-index: 150
```
アイコン: `List` from lucide-react（size 24）。デスクトップ（md:）では `hidden`。

```tsx
<button
  className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#c85a2c] text-white
    flex items-center justify-center shadow-[0_4px_16px_rgba(200,90,44,0.4)]
    z-[150] border-none cursor-pointer active:scale-95 transition-transform"
  onClick={() => setListOpen(true)}
>
  <List size={24} />
</button>
```

#### 右スライドパネル
```
position: fixed
top: 52px（Navbar直下）
right: 0
bottom: 0
width: min(85vw, 320px)
background: #f4f7f0
z-index: 200
transition: transform 0.28s ease
transform: translateX(0) or translateX(100%)
```

パネル上部に閉じる `[×]` ボタン（または `X` アイコン）を設置。  
内部は現行サイドバーの JSX（検索欄・件数バッジ・カードリスト）をそのまま流用。

```tsx
{/* 右スライドパネル（モバイル専用） */}
<div className={`md:hidden fixed top-[52px] right-0 bottom-0 w-[min(85vw,320px)] bg-[#f4f7f0]
  z-[200] flex flex-col overflow-hidden
  transition-transform duration-[280ms] ease-in-out
  ${listOpen ? 'translate-x-0' : 'translate-x-full'}`}>
  {/* 閉じるボタン */}
  <div className="flex justify-end p-3 shrink-0">
    <button onClick={() => setListOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      <X size={20} color="#4a6840" />
    </button>
  </div>
  {/* 検索欄・カードリスト（既存JSXを流用） */}
</div>
```

#### バックドロップ
```
position: fixed, inset: 0
background: rgba(0,0,0,0.35)
z-index: 199（パネルより1低い）
transition: opacity 0.28s ease
```
タップで `listOpen = false`。

#### イベント選択時の挙動
`handleSelectFestival` 内で `setListOpen(false)` を呼び、パネルを閉じて地図にフォーカスさせる。

#### state 変更
```tsx
// 削除
const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

// 追加
const [listOpen, setListOpen] = useState(false);
```

---

## 変更対象ファイル

| ファイル | 変更規模 |
|---------|---------|
| `src/components/Navbar.tsx` | 中（ドロワー構造への置き換え、`fetchMe` 追加） |
| `src/pages/MapPage.tsx` | 中（タブ削除、FAB 追加、右パネル追加） |
