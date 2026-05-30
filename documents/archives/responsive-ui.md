# モバイル対応 実装仕様書（Tailwind CSS）

## ブレークポイント定義

Tailwind CSS のデフォルトブレークポイントを使用する。

| prefix | 幅 | 用途 |
|--------|----|------|
| （なし）| 0px〜 | モバイルのデフォルトスタイル |
| `md:` | ≥768px | タブレット・デスクトップ |

**実装方針**: Tailwind はモバイルファーストのため、デフォルトをモバイル用スタイルとし `md:` でデスクトップを上書きする。レスポンシブ対応が必要なプロパティのみインラインスタイルから `className` に移行する。インラインスタイルで問題ないプロパティはそのままにする。

---

## 問題一覧と優先度

| 優先度 | コンポーネント | 問題 |
|--------|--------------|------|
| 高 | `MapPage` | サイドバー（300px固定）が常時表示されモバイルで地図がほぼゼロ幅になる |
| 高 | `Navbar` | ナビリンクが横一列でスマートフォン幅（375px）で溢れる |
| 中 | `PhotoGallery` | `repeat(4, 1fr)` が375px幅では1枚約86pxと小さすぎる |
| 低 | `FestivalDetailPage` | ヒーローH1の`fontSize: 28px`が320px幅で大きすぎる。上部パディング過大 |
| 低 | `CMSPage` / `EditFestivalPage` | 郵便番号行（input＋button横並び）が320px画面でタイト |

---

## 変更対象ファイル一覧

| ファイル | 変更規模 |
|---------|---------|
| `src/pages/MapPage.tsx` | 大 |
| `src/components/Navbar.tsx` | 中 |
| `src/components/PhotoGallery.tsx` | 小 |
| `src/pages/FestivalDetailPage.tsx` | 小 |
| `src/pages/CMSPage.tsx` | 小 |
| `src/pages/EditFestivalPage.tsx` | 小 |

`useWindowWidth` フックは不要（Tailwind で対応）。

---

## 1. MapPage（優先度：高）

### 問題
`width: '300px'` サイドバーが常時表示。モバイルでは地図エリアが 75px 以下になる。

### 実装方針

**デスクトップ（md:）**: 現行の左右分割レイアウトを維持。  
**モバイル**: 「地図」「リスト」タブで切り替える全画面表示。

JSX の最外ラッパーと各子要素を、インラインスタイルから Tailwind クラスに移行する。タブ切り替え用の `mobileTab` state を追加する。

#### 最外ラッパー

```tsx
// before（インラインスタイル）
<div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>

// after（Tailwind）
<div className="flex h-[calc(100vh-52px)] overflow-hidden flex-col md:flex-row">
```

#### モバイル用タブバー（md: で非表示）

```tsx
<div className="flex md:hidden border-b border-[#c8d8be] bg-[#f4f7f0] shrink-0">
  <button
    onClick={() => setMobileTab('map')}
    className={`flex-1 py-2.5 text-[13px] font-semibold font-[var(--font-body)] border-b-2 transition-colors
      ${mobileTab === 'map' ? 'bg-white text-[#1c2e17] border-[#c85a2c]' : 'bg-transparent text-[#7a9470] border-transparent'}`}
  >
    🗺 地図
  </button>
  <button
    onClick={() => setMobileTab('list')}
    className={`flex-1 py-2.5 text-[13px] font-semibold font-[var(--font-body)] border-b-2 transition-colors
      ${mobileTab === 'list' ? 'bg-white text-[#1c2e17] border-[#c85a2c]' : 'bg-transparent text-[#7a9470] border-transparent'}`}
  >
    📋 リスト
  </button>
</div>
```

#### サイドバー

```tsx
// モバイルでは mobileTab === 'list' のときのみ表示、デスクトップでは常時表示
<div className={`
  flex-col overflow-hidden h-full
  bg-[#f4f7f0] border-r border-[#d6e4ce]
  md:flex md:w-[300px] md:shrink-0
  ${mobileTab === 'list' ? 'flex flex-1' : 'hidden'}
`}>
  {/* 検索欄・カードリストはそのまま */}
</div>
```

#### 地図エリア

```tsx
// モバイルでは mobileTab === 'map' のときのみ表示、デスクトップでは常時表示
<div className={`
  relative overflow-hidden
  md:flex md:flex-1
  ${mobileTab === 'map' ? 'flex flex-1' : 'hidden'}
`}>
  <MapView ... />
</div>
```

#### state 追加

```tsx
const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
```

---

## 2. Navbar（優先度：高）

### 問題
ロゴ＋ナビリンク＋認証リンクが横一列でスマートフォン幅（375px）で溢れる。

### 実装方針

**デスクトップ（md:）**: 現行の横並びレイアウトを維持。  
**モバイル**: ロゴ＋ハンバーガーアイコンのみ表示。タップでドロップダウンを開く。

`lucide-react` の `Menu` / `X` アイコンを使用。ドロップダウンの外クリックで閉じる処理は `useEffect` で実装。

#### Navbar 本体の nav タグ

```tsx
// padding を Tailwind に移行（レスポンシブ対応のため）
<nav className="bg-[#2d5422] text-white px-4 md:px-6 flex items-center justify-between h-[52px] shadow-[0_2px_8px_rgba(28,46,23,0.18)] sticky top-0 z-[100]">
```

#### ナビリンク群（モバイル非表示）

```tsx
// デスクトップのみ表示
<div className="hidden md:flex gap-5 items-center">
  {links.map(...)}
  {/* 認証リンク */}
</div>
```

#### ハンバーガーボタン（モバイルのみ表示）

```tsx
<button
  onClick={() => setMenuOpen(!menuOpen)}
  className="md:hidden text-white bg-transparent border-none cursor-pointer p-1"
>
  {menuOpen ? <X size={22} /> : <Menu size={22} />}
</button>
```

#### ドロップダウンメニュー

```tsx
{menuOpen && (
  <div className="md:hidden fixed top-[52px] left-0 right-0 bg-[#2d5422] z-[200] shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex flex-col">
    {links.map(({ to, label }) => (
      <Link
        key={to}
        to={to}
        onClick={() => setMenuOpen(false)}
        className="px-6 py-3.5 text-[14px] font-medium border-b border-[rgba(255,255,255,0.1)] text-white no-underline hover:bg-[rgba(255,255,255,0.08)] transition-colors"
      >
        {label}
      </Link>
    ))}
    <div className="px-6 py-3 flex gap-4 items-center">
      {isAuthenticated ? (
        <>
          <Link to="/account" onClick={() => setMenuOpen(false)} className="text-[13px] text-[rgba(255,255,255,0.8)] no-underline">アカウント</Link>
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-[13px] text-[rgba(255,255,255,0.8)] bg-transparent border-none cursor-pointer p-0">ログアウト</button>
        </>
      ) : (
        <Link to="/login" onClick={() => setMenuOpen(false)} className="text-[13px] px-3.5 py-1.5 rounded-lg bg-[#c85a2c] text-white no-underline">ログイン</Link>
      )}
    </div>
  </div>
)}
```

#### state / useEffect 追加

```tsx
const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
  if (!menuOpen) return;
  const handler = () => setMenuOpen(false);
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, [menuOpen]);
```

---

## 3. PhotoGallery（優先度：中）

### 問題
`gridTemplateColumns: 'repeat(4, 1fr)'` の固定4列で、モバイルでは各写真が約86pxと小さすぎる。

### 実装方針

インラインスタイルのグリッドを Tailwind クラスに変更する。

```tsx
// before
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>

// after
<div className="grid grid-cols-3 md:grid-cols-4 gap-2">
```

モバイル3列（各約118px @ 375px幅）、デスクトップ4列。`style` の `display: grid` と `gridTemplateColumns` は削除し、`className` で管理。`gap` はそのままインラインスタイルに残してもよいが、Tailwind `gap-2`（8px）に統一する。

---

## 4. FestivalDetailPage（優先度：低）

### 問題
- ヒーロー内 `fontSize: '28px'` が320px幅で大きい
- `padding: '32px 20px'` の上部32pxがモバイルで余裕がありすぎる

### 実装方針

最外ラッパーと h1 のみ変更する。

```tsx
// 最外ラッパーのパディング
// before: style={{ padding: '32px 20px' }}
// after:
<div className="px-4 pt-4 pb-8 md:px-5 md:pt-8" style={{ maxWidth: '720px', margin: '0 auto', background: '#f4f7f0', minHeight: '100vh' }}>

// ヒーロー h1
// before: style={{ fontSize: '28px', ... }}
// after: Tailwind でサイズを上書き（他スタイルはインラインで保持）
<h1 className="text-[22px] md:text-[28px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', ... }}>
```

---

## 5. CMSPage / EditFestivalPage（優先度：低）

### 問題
郵便番号行（input＋「住所を検索」ボタン横並び）が320px画面でタイト。

### 実装方針

郵便番号行の `display: flex` 部分を Tailwind に変更する。

```tsx
// before: style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}
// after:
<div className="flex flex-col gap-2 mb-3 md:flex-row md:gap-2">
  <div className="md:flex-1">
    <input ... />
  </div>
  <div className="flex md:items-end">
    <button className="w-full md:w-auto" ...>住所を検索</button>
  </div>
</div>
```

モバイルでは input の下にボタンが来る縦並び、デスクトップでは現行の横並びを維持。
