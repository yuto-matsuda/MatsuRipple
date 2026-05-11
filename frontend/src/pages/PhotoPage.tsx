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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.04em', margin: 0 }}>
          写真ギャラリー
        </h1>
        {isAuthenticated && (
          <label style={{ fontSize: '13px', fontWeight: 500, padding: '8px 18px', borderRadius: '8px', background: '#4e8b3f', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {uploading ? 'アップロード中...' : '写真をアップロード'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </label>
        )}
      </div>
      {loading && <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>}
      {error && <div style={{ fontSize: '13px', color: '#c85a2c', fontFamily: 'var(--font-body)' }}>{error}</div>}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #c8d8be', boxShadow: '0 1px 6px rgba(28,46,23,0.08)' }}>
        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
}
