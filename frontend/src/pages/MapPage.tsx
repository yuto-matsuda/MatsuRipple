import { useState } from 'react';
import useFestivals from '../hooks/useFestivals';
import { MapView } from '../components/MapView';
import { FestivalCard } from '../components/FestivalCard';
import type { Festival } from '../types/festival';

export function MapPage() {
  const { festivals, loading } = useFestivals();
  const [search, setSearch] = useState('');
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [focusKey, setFocusKey] = useState(0);

  const handleSelectFestival = (festival: Festival) => {
    setActiveFestival(festival);
    setFocusKey((k) => k + 1);
  };

  const filtered = festivals.filter(
    (f) => f.name.includes(search) || (f.region ?? '').includes(search),
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>

      {/* ── サイドバー ── */}
      <div style={{
        width: '300px',
        flexShrink: 0,
        background: '#f4f7f0',
        borderRight: '1px solid #d6e4ce',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}>

        {/* 検索欄 */}
        <div style={{ padding: '14px 12px 10px', background: '#f4f7f0' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '13px', color: '#9ab88e', pointerEvents: 'none',
            }}>🔍</span>
            <input
              type='text'
              placeholder='祭りを検索...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: '1.5px solid #c8d8be',
                borderRadius: '10px',
                padding: '9px 12px 9px 32px',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                color: '#1c2e17',
                background: 'white',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 1px 4px rgba(28,46,23,0.06)',
              }}
            />
          </div>
        </div>

        {/* 件数バッジ */}
        <div style={{ padding: '0 14px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'white',
            background: '#4e8b3f',
            borderRadius: '10px',
            padding: '2px 8px',
            fontFamily: 'var(--font-body)',
          }}>
            {filtered.length}
          </span>
          <span style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>件のお祭り</span>
        </div>

        {/* カードリスト */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
          {loading ? (
            <div style={{ fontSize: '12px', color: '#7a9470', padding: '16px 4px', fontFamily: 'var(--font-body)' }}>
              読み込み中...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#7a9470', textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-body)' }}>
              祭り情報がまだありません
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {filtered.map((festival) => (
                <FestivalCard
                  key={festival.id}
                  festival={festival}
                  isActive={activeFestival?.id === festival.id}
                  onClick={handleSelectFestival}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 地図エリア ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapView
          festivals={filtered}
          height='100%'
          activeFestival={activeFestival}
          focusKey={focusKey}
          onSelectFestival={handleSelectFestival}
        />

      </div>
    </div>
  );
}
