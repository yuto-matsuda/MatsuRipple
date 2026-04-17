import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { createFestival } from '../api/festivals';
import type { FestivalCreate } from '../types/festival';

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function CMSPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FestivalCreate>({ name: '' });
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPinPos([lat, lng]);
    setForm((prev) => ({ ...prev, location_lat: lat, location_lng: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const festival = await createFestival(form);
      navigate(`/festivals/${festival.id}`);
    } catch {
      setError('投稿に失敗しました。ログインしているか確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">祭り情報を投稿</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">祭り名 *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">地域</label>
          <input
            type="text"
            value={form.region ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開催日</label>
          <input
            type="date"
            value={form.date ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            rows={4}
            value={form.description ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            開催場所（地図をクリックしてピンを立てる）
          </label>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
            <MapContainer center={[36.2048, 138.2529]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onSelect={handleLocationSelect} />
              {pinPos && <Marker position={pinPos} />}
            </MapContainer>
          </div>
          {pinPos && (
            <p className="text-xs text-gray-500 mt-1">
              緯度: {pinPos[0].toFixed(5)} / 経度: {pinPos[1].toFixed(5)}
            </p>
          )}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 disabled:opacity-50 transition-colors font-medium"
        >
          {submitting ? '投稿中...' : '投稿する'}
        </button>
      </form>
    </div>
  );
}
