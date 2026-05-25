import { useState } from 'react';
import useFestivals from '../hooks/useFestivals';
import { MapView } from '../components/MapView';
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
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden', background: '#f4f7f0' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', flexShrink: 0, background: 'white', borderRight: '1px solid #c8d8be', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #c8d8be' }}>
          <input
            type="text"
            placeholder="祭りを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', border: '1.5px solid #c8d8be', borderRadius: '8px',
              padding: '8px 12px', fontSize: '13px', fontFamily: 'var(--font-body)',
              color: '#1c2e17', background: '#f4f7f0', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ fontSize: '12px', color: '#7a9470', padding: '8px 2px' }}>読み込み中...</div>
          ) : (
            <>
              <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)', marginBottom: '10px', paddingLeft: '2px' }}>
                {filtered.length}件のお祭り
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map((festival) => (
                  <div
                    key={festival.id}
                    onClick={() => handleSelectFestival(festival)}
                    style={{
                      background: activeFestival?.id === festival.id ? '#edf3e7' : 'white',
                      border: `1.5px solid ${activeFestival?.id === festival.id ? '#9ab88e' : '#c8d8be'}`,
                      borderLeft: activeFestival?.id === festival.id ? '3px solid #c85a2c' : '1.5px solid #c8d8be',
                      borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: activeFestival?.id === festival.id ? '0 2px 8px rgba(28,46,23,0.1)' : 'none',
                    }}
                  >
                    {festival.region && (
                      <div style={{ fontSize: '11px', color: '#c85a2c', fontWeight: 600, marginBottom: '2px' }}>{festival.region}</div>
                    )}
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '3px' }}>
                      {festival.name}
                    </div>
                    {festival.start_datetime && (
                      <div style={{ fontSize: '11px', color: '#7a9470' }}>{festival.start_datetime.replace('T', ' ').slice(0, 16)}</div>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ fontSize: '13px', color: '#7a9470', textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-body)' }}>
                    祭り情報がまだありません
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapView
          festivals={filtered}
          height="100%"
          activeFestival={activeFestival}
          focusKey={focusKey}
          onSelectFestival={handleSelectFestival}
        />

      </div>
    </div>
  );
}
