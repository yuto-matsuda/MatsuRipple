import usePhotos from '../hooks/usePhotos';
import { PhotoGallery } from '../components/PhotoGallery';

export function PhotoPage() {
  const { photos, loading, uploading, error, upload } = usePhotos();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPublic = window.confirm('この写真を公開しますか？（キャンセルで非公開）');
    await upload(file, isPublic);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">写真ギャラリー</h1>
        {isAuthenticated && (
          <label className="cursor-pointer bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors text-sm font-medium">
            {uploading ? 'アップロード中...' : '写真をアップロード'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
      {loading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <PhotoGallery photos={photos} />
    </div>
  );
}
