import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchFestival } from '../api/festivals';
import type { Festival } from '../types/festival';
import { ParticipationForm } from '../components/ParticipationForm';
import { PhotoGallery } from '../components/PhotoGallery';
import useParticipants from '../hooks/useParticipants';
import usePhotos from '../hooks/usePhotos';

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const festivalId = Number(id);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const { register, submitting, error, success } = useParticipants();
  const { photos, uploading, upload } = usePhotos(festivalId);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    fetchFestival(festivalId)
      .then(setFestival)
      .finally(() => setLoading(false));
  }, [festivalId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPublic = window.confirm('この写真を公開しますか？（キャンセルで非公開）');
    await upload(file, isPublic);
  };

  if (loading) return <div className="p-8 text-gray-500">読み込み中...</div>;
  if (!festival) return <div className="p-8 text-red-600">祭りが見つかりません</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{festival.name}</h1>
        {festival.region && <p className="text-red-600 font-medium">{festival.region}</p>}
        {festival.date && <p className="text-gray-500 text-sm mt-1">開催日: {festival.date}</p>}
        {festival.description && (
          <p className="text-gray-700 mt-4 leading-relaxed">{festival.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">参加登録</h2>
        <ParticipationForm
          festivalId={festivalId}
          onSubmit={register}
          submitting={submitting}
          success={success}
          error={error}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">写真</h2>
          {isAuthenticated && (
            <label className="cursor-pointer bg-red-700 text-white text-sm px-3 py-1.5 rounded-md hover:bg-red-800 transition-colors">
              {uploading ? 'アップロード中...' : '写真を追加'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>
        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
}
