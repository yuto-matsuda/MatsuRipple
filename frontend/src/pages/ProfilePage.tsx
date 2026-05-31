import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Paperclip, X } from 'lucide-react';
import useProfile from '../hooks/useProfile';
import useDeleteAccount from '../hooks/useDeleteAccount';
import { PhotoLightbox } from '../components/PhotoLightbox';

const sectionCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #d6e4ce',
  borderRadius: '14px',
  padding: '20px 24px',
  marginBottom: '14px',
  boxShadow: '0 2px 10px rgba(28,46,23,0.07)',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '15px',
  fontWeight: 700,
  color: '#1c2e17',
  letterSpacing: '0.02em',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#4a6840',
  marginBottom: '5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #c8d8be',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1c2e17',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
};

export function ProfilePage() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const {
    user, postedFestivals, participatedFestivals, photos,
    loading, uploading, upload, updateVisibility, removePhoto, removeFestival,
  } = useProfile();
  const { showConfirm, loading: deleteLoading, error: deleteError, openConfirm, closeConfirm, confirm } = useDeleteAccount();

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 祭り削除
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [festivalDeleting, setFestivalDeleting] = useState(false);
  const [festivalDeleteError, setFestivalDeleteError] = useState<string | null>(null);

  // 写真アップロード
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [photoIsPublic, setPhotoIsPublic] = useState(true);
  const [photoFestivalId, setPhotoFestivalId] = useState<number | ''>('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleFestivalDelete = async () => {
    if (confirmDeleteId === null) return;
    setFestivalDeleting(true);
    setFestivalDeleteError(null);
    const ok = await removeFestival(confirmDeleteId);
    setFestivalDeleting(false);
    if (ok) setConfirmDeleteId(null);
    else setFestivalDeleteError('削除に失敗しました。');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowUpload(true);
    }
  };

  const handleUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!pendingFile) return;
    const festivalId = photoFestivalId !== '' ? photoFestivalId : undefined;
    await upload(pendingFile, photoIsPublic, festivalId);
    setPendingFile(null);
    setPhotoIsPublic(true);
    setPhotoFestivalId('');
    setShowUpload(false);
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  const handleCancelUpload = () => {
    setPendingFile(null);
    setPhotoIsPublic(true);
    setPhotoFestivalId('');
    setShowUpload(false);
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
        <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
      </div>
    );
  }

  // 参加した祭り（自動表示）で公開写真選択に使う候補
  const festivalsForPhoto = participatedFestivals;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 48px', background: '#f4f7f0', minHeight: '100vh' }}>

      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4e8b3f 0%, #2d5422 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 700, color: 'white', flexShrink: 0,
          fontFamily: 'var(--font-display)',
        }}>
          {user?.username.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#1c2e17', margin: 0, letterSpacing: '0.04em' }}>
            {user?.username}
          </h1>
          <div style={{ fontSize: '12px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>{user?.email}</div>
        </div>
      </div>

      {/* ── 投稿した祭り ── */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={sectionTitle}>投稿した祭り</div>
          {postedFestivals.length > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: '#4e8b3f', borderRadius: '10px', padding: '2px 9px', fontFamily: 'var(--font-body)' }}>
              {postedFestivals.length}件
            </span>
          )}
        </div>

        {postedFestivals.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '20px 0' }}>
            まだ祭り情報を投稿していません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {postedFestivals.map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(`/festivals/${f.id}`)}
                onMouseEnter={() => setHoveredId(f.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: 'white',
                  border: '1.5px solid',
                  borderColor: hoveredId === f.id ? '#c8d8be' : '#e4eddf',
                  borderLeft: `4px solid ${hoveredId === f.id ? '#dca880' : 'transparent'}`,
                  borderRadius: '12px', padding: '11px 14px', cursor: 'pointer',
                  boxShadow: hoveredId === f.id ? '0 4px 14px rgba(28,46,23,0.10)' : '0 1px 4px rgba(28,46,23,0.06)',
                  transform: hoveredId === f.id ? 'translateY(-1px)' : 'translateY(0)',
                  transition: 'all 0.18s ease',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {f.region && (
                    <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, color: '#c85a2c', background: '#fff0e8', borderRadius: '4px', padding: '1px 6px', marginBottom: '4px' }}>
                      {f.region}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#1c2e17', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </div>
                  {f.start_datetime && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#c85a2c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} />{f.start_datetime.replace('T', ' ').slice(0, 16)}
                    </div>
                  )}
                  {f.venue && (
                    <div style={{ fontSize: '11px', color: '#7a9470', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} />{f.venue}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  {f.thumbnail_url && (
                    <img src={f.thumbnail_url} alt={f.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e4eddf' }} />
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/festivals/${f.id}/participants`); }}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', background: '#fff0e8', color: '#c85a2c', border: '1px solid #e8c0a0', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      参加者
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/cms/${f.id}`); }}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', background: 'white', color: '#4a6840', border: '1px solid #c8d8be', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      編集
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(f.id); }}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', background: 'white', color: '#c85a2c', border: '1px solid #e8a080', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/cms')}
          style={{ background: '#4e8b3f', color: 'white', border: 'none', borderRadius: '9px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> 祭りを投稿する
        </button>
      </div>

      {/* ── 参加した祭り ── */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={sectionTitle}>参加した祭り</div>
          {participatedFestivals.length > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: '#c85a2c', borderRadius: '10px', padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
              {participatedFestivals.length}件
            </span>
          )}
        </div>

        {participatedFestivals.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '16px 0' }}>
            まだ参加した祭りがありません
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {participatedFestivals.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/festivals/${f.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff8f0', border: '1px solid #e8c0a0', borderRadius: '20px', padding: '5px 14px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}
              >
                {f.name}
                {f.start_datetime && (
                  <span style={{ fontSize: '10px', color: '#c85a2c', fontWeight: 600 }}>{f.start_datetime.slice(0, 10)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 写真 ── */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={sectionTitle}>写真 ({photos.length})</div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: '8px', background: uploading ? '#9ab88e' : '#4e8b3f', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            {uploading ? 'アップロード中...' : <><Plus size={13} /> 写真を追加</>}
            <input ref={photoFileRef} type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleFileSelect} />
          </label>
        </div>

        {/* アップロードパネル */}
        {showUpload && pendingFile && (
          <form onSubmit={handleUpload} style={{ background: '#f4f7f0', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #c8d8be' }}>
            <div style={{ fontSize: '13px', color: '#1c2e17', fontFamily: 'var(--font-body)', marginBottom: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Paperclip size={13} />{pendingFile.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>公開設定</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}>
                  <input type="radio" name="vis" checked={photoIsPublic} onChange={() => setPhotoIsPublic(true)} /> 公開
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}>
                  <input type="radio" name="vis" checked={!photoIsPublic} onChange={() => setPhotoIsPublic(false)} /> 非公開
                </label>
              </div>
            </div>
            {festivalsForPhoto.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>祭りに表示（任意）</label>
                <select style={inputStyle} value={photoFestivalId} onChange={(e) => setPhotoFestivalId(e.target.value !== '' ? Number(e.target.value) : '')}>
                  <option value=''>祭りに表示しない</option>
                  {festivalsForPhoto.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {photoFestivalId !== '' && photoIsPublic && (
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
                    公開設定のため、祭り詳細ページの写真欄にも表示されます
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleCancelUpload} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>キャンセル</button>
              <button type="submit" style={{ flex: 1, background: '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>アップロード</button>
            </div>
          </form>
        )}

        {/* 写真グリッド */}
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>写真はまだありません</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {photos.map((photo, i) => (
              <div key={photo.id} style={{ position: 'relative', aspectRatio: '1' }}>
                <div onClick={() => setLightboxIndex(i)} style={{ width: '100%', height: '100%', cursor: 'zoom-in' }}>
                  <img src={photo.filename} alt={photo.original_name ?? '写真'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #c8d8be', display: 'block' }} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); updateVisibility(photo.id, !photo.is_public); }}
                  title={photo.is_public ? '非公開にする' : '公開にする'}
                  style={{ position: 'absolute', top: '5px', left: '5px', background: photo.is_public ? 'rgba(78,139,63,0.85)' : 'rgba(100,100,100,0.75)', color: 'white', border: 'none', borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', backdropFilter: 'blur(2px)' }}
                >
                  {photo.is_public ? '公開' : '非公開'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        {lightboxIndex !== null && (
          <PhotoLightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </div>

      {/* ── 退会 ── */}
      <div style={{ ...sectionCard, borderColor: '#f0c0a0', background: '#fffaf8' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#c85a2c', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>退会</div>
        <p style={{ fontSize: '12px', color: '#7a9470', margin: '0 0 14px', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
          退会すると、アカウントへのアクセスができなくなります。
        </p>
        <button
          onClick={openConfirm}
          style={{ background: 'white', color: '#c85a2c', border: '1.5px solid #c85a2c', borderRadius: '9px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
        >
          退会する
        </button>
      </div>

      {/* 祭り削除確認ダイアログ */}
      {confirmDeleteId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,10,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px 28px', width: '100%', maxWidth: '320px', boxShadow: '0 16px 48px rgba(0,0,0,0.20)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#1c2e17', marginBottom: '10px' }}>祭りを削除しますか？</div>
            <p style={{ fontSize: '13px', color: '#7a9470', marginBottom: '24px', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
              削除すると元に戻せません。投稿した写真もあわせて削除されます。
            </p>
            {festivalDeleteError && (
              <p style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px', fontFamily: 'var(--font-body)' }}>{festivalDeleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setConfirmDeleteId(null); setFestivalDeleteError(null); }} disabled={festivalDeleting} style={{ flex: 1, background: '#f4f7f0', color: '#4a6840', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>キャンセル</button>
              <button onClick={handleFestivalDelete} disabled={festivalDeleting} style={{ flex: 1, background: festivalDeleting ? '#e8a090' : '#c85a2c', color: 'white', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: festivalDeleting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {festivalDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退会確認ダイアログ */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,10,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px 28px', width: '100%', maxWidth: '320px', boxShadow: '0 16px 48px rgba(0,0,0,0.20)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#1c2e17', marginBottom: '10px' }}>本当に退会しますか？</div>
            <p style={{ fontSize: '13px', color: '#7a9470', marginBottom: '24px', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
              退会するとアカウントにアクセスできなくなります。この操作は取り消せません。
            </p>
            {deleteError && (
              <p style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px', fontFamily: 'var(--font-body)' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={closeConfirm} disabled={deleteLoading} style={{ flex: 1, background: '#f4f7f0', color: '#4a6840', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>キャンセル</button>
              <button onClick={confirm} disabled={deleteLoading} style={{ flex: 1, background: deleteLoading ? '#e8a090' : '#c85a2c', color: 'white', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: deleteLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {deleteLoading ? '処理中...' : '退会する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
