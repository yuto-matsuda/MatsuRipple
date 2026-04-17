import useFestivals from '../hooks/useFestivals';
import { MapView } from '../components/MapView';
import { FestivalCard } from '../components/FestivalCard';

export function MapPage() {
  const { festivals, loading, error } = useFestivals();

  return (
    <div>
      <div style={{ height: '500px' }}>
        {!loading && <MapView festivals={festivals} height="500px" />}
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">お祭り一覧</h2>
        {loading && <p className="text-gray-500">読み込み中...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {festivals.map((festival) => (
            <FestivalCard key={festival.id} festival={festival} />
          ))}
        </div>
        {!loading && festivals.length === 0 && (
          <p className="text-gray-500 text-center py-12">祭り情報がまだ登録されていません</p>
        )}
      </div>
    </div>
  );
}
