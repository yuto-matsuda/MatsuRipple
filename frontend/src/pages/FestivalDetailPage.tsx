import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchFestival } from '../api/festivals';
import type { Festival } from '../types/festival';
import { fetchFestivalGallery } from '../api/festivalGallery';
import type { FestivalGalleryPhoto } from '../types/festivalGallery';
import { ParticipationForm } from '../components/ParticipationForm';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoSwiper } from '../components/PhotoSwiper';
import useParticipants from '../hooks/useParticipants';
import usePhotos from '../hooks/usePhotos';

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const festivalId = Number(id);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState<FestivalGalleryPhoto[]>([]);
  const { register, submitting, error, success } = useParticipants();
  const { photos, uploading, upload } = usePhotos(festivalId);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    fetchFestival(festivalId)
      .then(setFestival)
      .finally(() => setLoading(false));
  }, [festivalId]);

  useEffect(() => {
    fetchFestivalGallery(festivalId).then(setGalleryPhotos);
  }, [festivalId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPublic = window.confirm('この写真を公開しますか？（キャンセルで非公開）');
    await upload(file, isPublic);
  };

  const sectionCard: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #c8d8be',
    boxShadow: '0 1px 6px rgba(28,46,23,0.08)',
    marginBottom: '24px',
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 600,
    color: '#1c2e17',
    marginBottom: '16px',
  };

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
      読み込み中...
    </div>
  );
  if (!festival) return (
    <div style={{ padding: '48px', textAlign: 'center', color: '#c85a2c', fontFamily: 'var(--font-body)' }}>
      祭りが見つかりません
    </div>
  );

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/')}
        style={{ fontSize: '13px', color: '#4a6840', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontFamily: 'var(--font-body)' }}
      >
        ← 地図に戻る
      </button>

      {/* Hero banner */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '28px', position: 'relative', height: '200px', background: 'linear-gradient(135deg, #2d5422 0%, #4e8b3f 60%, #6aab4d 100%)', ...(festival.thumbnail_url ? { backgroundImage: `url(${festival.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,46,23,0.7) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
          {festival.region && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.06em' }}>
              {festival.region}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '0.04em', lineHeight: 1.2, margin: 0 }}>
            {festival.name}
          </h1>
          {festival.start_datetime && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '6px' }}>
              📅 {festival.start_datetime.replace('T', ' ').slice(0, 16)}
              {festival.end_datetime && ` 〜 ${festival.end_datetime.replace('T', ' ').slice(0, 16)}`}
            </div>
          )}
          {festival.venue && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.70)', marginTop: '3px' }}>
              📍 {festival.venue}
            </div>
          )}
        </div>
      </div>

      {/* Topic photo swiper */}
      {galleryPhotos.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <PhotoSwiper photos={galleryPhotos} />
        </div>
      )}

      {/* Description */}
      {festival.description && (
        <div style={sectionCard}>
          <p style={{ fontSize: '14px', color: '#1c2e17', lineHeight: 1.8, fontFamily: 'var(--font-body)', margin: 0 }}>
            {festival.description}
          </p>
        </div>
      )}

      {/* Participation form */}
      <div style={sectionCard}>
        <div style={sectionTitle}>参加登録</div>
        <ParticipationForm
          festivalId={festivalId}
          onSubmit={register}
          submitting={submitting}
          success={success}
          error={error}
        />
      </div>

      {/* Photo gallery */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={sectionTitle}>写真</div>
          {isAuthenticated && (
            <label style={{ fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', background: '#4e8b3f', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {uploading ? 'アップロード中...' : '写真を追加'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
          )}
        </div>
        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
}
