import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Calendar, MapPin, Paperclip } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { fetchFestival } from '../api/festivals';
import type { Festival } from '../types/festival';
import { fetchFestivalGallery } from '../api/festivalGallery';
import type { FestivalGalleryPhoto } from '../types/festivalGallery';
import { ParticipationForm } from '../components/ParticipationForm';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoSwiper } from '../components/PhotoSwiper';
import useParticipants from '../hooks/useParticipants';
import usePhotos from '../hooks/usePhotos';
import useReviews from '../hooks/useReviews';

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const festivalId = Number(id);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState<FestivalGalleryPhoto[]>([]);
  const { register, submitting, error, success } = useParticipants();
  const { photos, uploading, upload } = usePhotos(festivalId);
  const { reviews, submitting: reviewSubmitting, submit: submitReview } = useReviews(festivalId);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewResult, setReviewResult] = useState<{ ok: boolean; message: string } | null>(null);
  const isAuthenticated = !!localStorage.getItem('token');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isPublicUpload, setIsPublicUpload] = useState(true);

  useEffect(() => {
    fetchFestival(festivalId)
      .then(setFestival)
      .finally(() => setLoading(false));
  }, [festivalId]);

  useEffect(() => {
    fetchFestivalGallery(festivalId).then(setGalleryPhotos);
  }, [festivalId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPendingFile(file); setShowUploadPanel(true); }
  };

  const handleUploadConfirm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!pendingFile) return;
    await upload(pendingFile, isPublicUpload);
    setPendingFile(null);
    setIsPublicUpload(true);
    setShowUploadPanel(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadCancel = () => {
    setPendingFile(null);
    setIsPublicUpload(true);
    setShowUploadPanel(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="px-4 pt-4 pb-8 md:px-5 md:pt-8" style={{ maxWidth: '720px', margin: '0 auto', background: '#f4f7f0', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/')}
        style={{ fontSize: '13px', color: '#4a6840', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontFamily: 'var(--font-body)' }}
      >
        <ChevronLeft size={16} /> 地図に戻る
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
          <h1 className="text-[22px] md:text-[28px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', letterSpacing: '0.04em', lineHeight: 1.2, margin: 0 }}>
            {festival.name}
          </h1>
          {festival.start_datetime && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={12} />
              {festival.start_datetime.replace('T', ' ').slice(0, 16)}
              {festival.end_datetime && ` 〜 ${festival.end_datetime.replace('T', ' ').slice(0, 16)}`}
            </div>
          )}
          {festival.venue && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.70)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={12} />
              {festival.venue}
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

      {/* 開催場所の地図 */}
      {festival.location_lat && festival.location_lng && (
        <div style={{ ...sectionCard, padding: 0, overflow: 'hidden', position: 'relative', zIndex: 0, isolation: 'isolate' }}>
          <MapContainer
            center={[festival.location_lat, festival.location_lng]}
            zoom={14}
            style={{ height: '220px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[festival.location_lat, festival.location_lng]} />
          </MapContainer>
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
            <label style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', background: uploading ? '#9ab88e' : '#4e8b3f', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
              {uploading ? 'アップロード中...' : '写真を追加'}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleFileSelect} />
            </label>
          )}
        </div>

        {/* アップロードオプションパネル */}
        {showUploadPanel && pendingFile && (
          <form onSubmit={handleUploadConfirm} style={{ background: '#f4f7f0', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #c8d8be' }}>
            <div style={{ fontSize: '13px', color: '#1c2e17', fontFamily: 'var(--font-body)', marginBottom: '10px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Paperclip size={13} />{pendingFile.name}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '6px' }}>公開設定</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}>
                  <input type="radio" name="festivalPhotoVis" checked={isPublicUpload} onChange={() => setIsPublicUpload(true)} /> 公開
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}>
                  <input type="radio" name="festivalPhotoVis" checked={!isPublicUpload} onChange={() => setIsPublicUpload(false)} /> 非公開
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleUploadCancel} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>キャンセル</button>
              <button type="submit" style={{ flex: 1, background: '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>アップロード</button>
            </div>
          </form>
        )}

        <PhotoGallery photos={photos} />
      </div>

      {/* 口コミ */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={sectionTitle}>口コミ ({reviews.length})</div>
          {isAuthenticated && !showReviewForm && (
            <button
              onClick={() => { setShowReviewForm(true); setReviewResult(null); }}
              style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', background: '#4e8b3f', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              口コミを書く
            </button>
          )}
        </div>

        {/* 投稿フォーム */}
        {showReviewForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await submitReview(reviewBody, reviewRating);
              setReviewResult({ ok: result.ok, message: result.ok ? '口コミを投稿しました！' : (result.message ?? '投稿に失敗しました') });
              if (result.ok) { setShowReviewForm(false); setReviewBody(''); setReviewRating(5); }
            }}
            style={{ background: '#f4f7f0', borderRadius: '10px', padding: '16px', marginBottom: '16px', border: '1px solid #c8d8be' }}
          >
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '8px' }}>評価</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n} type="button" onClick={() => setReviewRating(n)}
                    style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= reviewRating ? 1 : 0.3, padding: '0 2px' }}
                  >★</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>コメント</div>
              <textarea
                required
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="祭りの感想を書いてください..."
                style={{ width: '100%', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '9px 12px', fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1c2e17', background: 'white', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowReviewForm(false)} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>キャンセル</button>
              <button type="submit" disabled={reviewSubmitting} style={{ flex: 1, background: reviewSubmitting ? '#9ab88e' : '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: reviewSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                {reviewSubmitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        )}

        {reviewResult && (
          <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 600, color: reviewResult.ok ? '#4e8b3f' : '#c85a2c', fontFamily: 'var(--font-body)' }}>
            {reviewResult.message}
          </div>
        )}

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
            まだ口コミがありません。参加者の方はぜひ感想を投稿してください。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: '#f4f7f0', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e4eddf' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1c2e17', fontFamily: 'var(--font-body)' }}>{r.username}</span>
                    <span style={{ marginLeft: '8px', fontSize: '14px', color: '#c85a2c' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>{new Date(r.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#1c2e17', lineHeight: 1.7, fontFamily: 'var(--font-body)', margin: 0 }}>{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
