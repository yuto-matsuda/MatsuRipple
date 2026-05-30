import { useState } from 'react';
import { Search } from 'lucide-react';
import useFestivals from '../hooks/useFestivals';
import { MapView } from '../components/MapView';
import { FestivalCard } from '../components/FestivalCard';
import type { Festival } from '../types/festival';

const PAGE_LOAD_TIME = Date.now();

const isPast = (f: Festival) =>
  !!f.start_datetime && new Date(f.start_datetime).getTime() < PAGE_LOAD_TIME;

export function MapPage() {
  const { festivals, loading } = useFestivals();
  const [search, setSearch] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [focusKey, setFocusKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  const handleSelectFestival = (festival: Festival) => {
    setActiveFestival(festival);
    setFocusKey((k) => k + 1);
    setMobileTab('map');
  };

  const filtered = festivals.filter((f) => {
    if (!(f.name.includes(search) || (f.region ?? '').includes(search))) return false;
    if (!showPast && isPast(f)) return false;
    return true;
  });

  const pastCount = festivals.filter(isPast).length;

  return (
    <div className="flex flex-col h-[calc(100vh-52px)] overflow-hidden md:flex-row">

      {/* ── モバイルタブバー（md以上で非表示） ── */}
      <div className="flex md:hidden shrink-0 border-b border-[#d6e4ce] bg-[#f4f7f0]">
        {(['map', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer bg-transparent
              ${mobileTab === tab
                ? 'text-[#1c2e17] border-[#c85a2c] bg-white'
                : 'text-[#7a9470] border-transparent'
              }`}
            style={{ fontFamily: 'var(--font-body)', border: 'none', borderBottom: mobileTab === tab ? '2px solid #c85a2c' : '2px solid transparent' }}
          >
            {tab === 'map' ? '🗺 地図' : '📋 リスト'}
          </button>
        ))}
      </div>

      {/* ── サイドバー ── */}
      <div className={`flex-col overflow-hidden bg-[#f4f7f0] border-r border-[#d6e4ce] md:flex md:w-75 md:shrink-0 md:h-full ${mobileTab === 'list' ? 'flex flex-1' : 'hidden'}`}>

        {/* 検索欄 */}
        <div style={{ padding: '14px 12px 10px', background: '#f4f7f0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ab88e', pointerEvents: 'none' }} />
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

        {/* 件数バッジ + 過去表示トグル */}
        <div style={{ padding: '0 14px 8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: '#4e8b3f', borderRadius: '10px', padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
            {filtered.length}
          </span>
          <span style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>件のお祭り</span>
          {pastCount > 0 && (
            <button
              onClick={() => setShowPast((v) => !v)}
              style={{
                marginLeft: 'auto', fontSize: '10px', fontWeight: 600,
                color: showPast ? '#4e8b3f' : '#7a9470',
                background: showPast ? '#edf3e7' : 'transparent',
                border: `1px solid ${showPast ? '#9ab88e' : '#c8d8be'}`,
                borderRadius: '8px', padding: '2px 8px', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {showPast ? `過去を非表示` : `過去も表示 (${pastCount})`}
            </button>
          )}
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
      <div className={`relative overflow-hidden md:flex md:flex-1 ${mobileTab === 'map' ? 'flex flex-1' : 'hidden'}`}>
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
