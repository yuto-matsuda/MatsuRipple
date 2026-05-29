import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFestivals from '../hooks/useFestivals';
import { MapView } from '../components/MapView';
import { FestivalCard } from '../components/FestivalCard';
import type { Festival } from '../types/festival';

export function MapPage() {
  const { festivals, loading } = useFestivals();
  const [search, setSearch] = useState('');
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const navigate = useNavigate();

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
                  onClick={setActiveFestival}
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
          onSelectFestival={setActiveFestival}
        />

        {/* 選択ポップアップ */}
        {activeFestival && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid #d6e4ce',
            boxShadow: '0 8px 32px rgba(28,46,23,0.16)',
            minWidth: '260px',
            maxWidth: '340px',
            zIndex: 500,
          }}>
            {activeFestival.region && (
              <div style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 700,
                color: '#c85a2c',
                background: '#fff0e8',
                borderRadius: '4px',
                padding: '1px 7px',
                marginBottom: '6px',
                letterSpacing: '0.05em',
              }}>
                {activeFestival.region}
              </div>
            )}
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 700,
              color: '#1c2e17',
              marginBottom: '4px',
              lineHeight: 1.3,
            }}>
              {activeFestival.name}
            </div>
            {activeFestival.start_datetime && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#c85a2c', marginBottom: '4px' }}>
                📅 {activeFestival.start_datetime.replace('T', ' ').slice(0, 16)}
              </div>
            )}
            {activeFestival.venue && (
              <div style={{ fontSize: '12px', color: '#7a9470', marginBottom: '12px' }}>
                📍 {activeFestival.venue}
              </div>
            )}
            {!activeFestival.venue && activeFestival.start_datetime && (
              <div style={{ marginBottom: '12px' }} />
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveFestival(null)}
                style={{
                  background: '#f4f7f0',
                  color: '#4a6840',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                閉じる
              </button>
              <button
                onClick={() => navigate(`/festivals/${activeFestival.id}`)}
                style={{
                  flex: 1,
                  background: '#c85a2c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                詳細を見る →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
