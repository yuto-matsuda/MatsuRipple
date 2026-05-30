import { useState, useEffect } from 'react';
import { Search, List, X } from 'lucide-react';
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
  const [listOpen, setListOpen] = useState(false);

  const handleSelectFestival = (festival: Festival) => {
    setActiveFestival(festival);
    setFocusKey((k) => k + 1);
    setListOpen(false);
  };

  const filtered = festivals.filter((f) => {
    if (!(f.name.includes(search) || (f.region ?? '').includes(search))) return false;
    if (!showPast && isPast(f)) return false;
    return true;
  });

  const pastCount = festivals.filter(isPast).length;

  useEffect(() => {
    document.body.style.overflow = listOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [listOpen]);

  const listInner = (
    <>
      {/* 検索欄 */}
      <div style={{ padding: '14px 12px 10px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ab88e', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="祭りを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', border: '1.5px solid #c8d8be', borderRadius: '10px',
              padding: '9px 12px 9px 32px', fontSize: '13px', fontFamily: 'var(--font-body)',
              color: '#1c2e17', background: 'white', outline: 'none',
              boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(28,46,23,0.06)',
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
            {showPast ? '過去を非表示' : `過去も表示 (${pastCount})`}
          </button>
        )}
      </div>

      {/* カードリスト */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
        {loading ? (
          <div style={{ fontSize: '12px', color: '#7a9470', padding: '16px 4px', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#7a9470', textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-body)' }}>祭り情報がまだありません</div>
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
    </>
  );

  return (
    <div className="flex h-[calc(100vh-52px)] overflow-hidden">

      {/* ── デスクトップサイドバー（md以上のみ） ── */}
      <div className="hidden md:flex flex-col w-75 shrink-0 bg-[#f4f7f0] border-r border-[#d6e4ce] overflow-hidden h-full">
        {listInner}
      </div>

      {/* ── 地図エリア ── */}
      <div className="flex flex-1 relative overflow-hidden isolate">
        <MapView
          festivals={filtered}
          height="100%"
          activeFestival={activeFestival}
          focusKey={focusKey}
          onSelectFestival={handleSelectFestival}
        />
      </div>

      {/* FAB（モバイルのみ・地図divの外に配置してLeaflet transformの影響を回避） */}
      <button
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#c85a2c] text-white flex items-center justify-center border-none cursor-pointer active:scale-95 transition-transform"
        style={{ zIndex: 150, boxShadow: '0 4px 16px rgba(200,90,44,0.4)' }}
        onClick={() => setListOpen(true)}
      >
        <List size={24} />
      </button>

      {/* ── 右スライドパネル（モバイルのみ） ── */}

      {/* バックドロップ */}
      <div
        className={`md:hidden fixed inset-0 transition-opacity duration-280 ease-in-out ${listOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.35)', zIndex: 199 }}
        onClick={() => setListOpen(false)}
      />

      {/* パネル本体 */}
      <div
        className={`md:hidden fixed top-13 right-0 bottom-0 flex flex-col overflow-hidden bg-[#f4f7f0] transition-transform duration-280 ease-in-out ${listOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 'min(85vw, 320px)', zIndex: 200, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}
      >
        {/* 閉じるボタン */}
        <div className="flex justify-end px-3 pt-3 pb-1 shrink-0">
          <button onClick={() => setListOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            <X size={20} color="#4a6840" />
          </button>
        </div>
        {listInner}
      </div>
    </div>
  );
}
