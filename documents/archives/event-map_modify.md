# 地図・イベント一覧 修正仕様書

## 修正概要

| # | 変更内容 |
|---|---------|
| 1 | サイドバーのイベントカードクリック時に、画面下部の固定ポップアップを廃止し、対応するピンの上部にLeafletネイティブのポップアップを表示する |
| 2 | サイドバークリック・ピンクリックのいずれの場合も、そのピンに地図をフォーカス（pan + zoom）する |

---

## 現状の動作

- **サイドバークリック時**: `activeFestival` stateを更新し、`MapPage.tsx` 内の `position: absolute / bottom: 20px` の固定ポップアップを表示する
- **ピンクリック時**: Leaflet標準の `<Popup>` がピン上部に表示される（`onSelectFestival` は呼ばれるが地図はフォーカスしない）
- いずれの場合も地図はスクロール・ズームしない

---

## 変更後の動作

- **サイドバークリック時**:
  1. 対応するピンに地図をフォーカス（`map.setView(座標, zoom≥12)`）
  2. 対応するマーカーの Leaflet `<Popup>` をプログラム的に開く（`marker.openPopup()`）
- **ピンクリック時**:
  1. そのピンに地図をフォーカス（`map.setView(座標, zoom≥12)`）
  2. Leaflet デフォルト動作でポップアップが開く（変更なし）
- 画面下部の固定ポップアップは削除する

---

## ポップアップの表示内容

現在の Leaflet `<Popup>` はイベント名のみ表示しているため、以下に拡充する。

| 要素 | 内容 |
|------|------|
| サムネイル | `festival.thumbnail_url` が存在する場合、ポップアップ上部に横幅100%・高さ90px・`object-fit: cover` で表示 |
| 地域 | `festival.region`（vermilion, 11px） |
| イベント名 | `festival.name`（display font, 14px, bold） |
| 開始日時 | `festival.start_datetime`（12px, muted green） |
| 会場 | `festival.venue`（12px, muted green） |
| ボタン | 「詳細を見る →」→ `/festivals/:id` に遷移 |

---

## 実装方針

### MapPage.tsx（変更箇所：小）

- 画面下部の固定ポップアップ（`{activeFestival && <div style={{ position: 'absolute', bottom: '20px' ... }}>`）を削除する
- `activeFestival` state と `setActiveFestival` は引き続き保持し、`MapView` に渡す

### MapView.tsx（変更箇所：主）

#### 1. MapController コンポーネントを追加（`MapContainer` 内子コンポーネント）

`useMap()` は `MapContainer` の子コンポーネント内でしか使えないため、以下の責務を持つ内部コンポーネントを新設する。

```tsx
function MapController({
  activeFestival,
  markerRefs,
}: {
  activeFestival: Festival | null;
  markerRefs: React.RefObject<Map<number, L.Marker>>;
}) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!activeFestival) return;
    if (activeFestival.id === prevId.current) return;
    prevId.current = activeFestival.id;

    if (activeFestival.location_lat !== null && activeFestival.location_lng !== null) {
      map.setView(
        [activeFestival.location_lat, activeFestival.location_lng],
        Math.max(map.getZoom(), 12),
      );
    }

    // ポップアップをプログラム的に開く（わずかに遅延してsetView完了後に実行）
    setTimeout(() => {
      markerRefs.current?.get(activeFestival.id)?.openPopup();
    }, 100);
  }, [activeFestival, map, markerRefs]);

  return null;
}
```

#### 2. markerRefs を MapView に追加

```ts
const markerRefs = useRef<Map<number, L.Marker>>(new Map());
```

各 `<Marker>` に `ref` コールバックを追加し、マーカーインスタンスを登録する。

```tsx
<Marker
  key={festival.id}
  position={[festival.location_lat!, festival.location_lng!]}
  ref={(marker) => {
    if (marker) markerRefs.current.set(festival.id, marker);
    else markerRefs.current.delete(festival.id);
  }}
  eventHandlers={{
    click: () => onSelectFestival?.(festival),
  }}
>
```

#### 3. `<Popup>` の内容を拡充

詳細ポップアップ（地域・名前・日時・会場・詳細ボタン）に差し替える。

#### 4. MapController を MapContainer 内に配置

```tsx
<MapContainer ...>
  <TileLayer ... />
  <MapController activeFestival={activeFestival} markerRefs={markerRefs} />
  {withCoords.map((festival) => (
    <Marker ...>
      <Popup>...</Popup>
    </Marker>
  ))}
</MapContainer>
```

---

## 型・依存の追加

| 追加 | 用途 |
|------|------|
| `import * as L from 'leaflet'` | `L.Marker` 型参照 |
| `useRef, useEffect` | 既存 import に追加 |
| `useMap` | `react-leaflet` から追加（既に `CMSPage.tsx` 側では使用済み） |

---

## 変更対象ファイル

| ファイル | 変更規模 |
|---------|---------|
| `frontend/src/pages/MapPage.tsx` | 小（固定ポップアップ削除のみ） |
| `frontend/src/components/MapView.tsx` | 中（MapController追加・markerRefs・Popup拡充） |

---

## 変更しないもの

- サイドバーのカードスタイル・選択ハイライト（`activeFestival` による強調）
- `useFestivals` hook・API層
- `FestivalDetailPage.tsx` など他ページ
