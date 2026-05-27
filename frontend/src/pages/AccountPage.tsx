import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeleteAccount from '../hooks/useDeleteAccount';
import useUserHistory from '../hooks/useUserHistory';
import { deleteFestival } from '../api/festivals';
import { deletePhoto } from '../api/photos';
import { PhotoGallery } from '../components/PhotoGallery';

const sectionCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #c8d8be',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '16px',
  boxShadow: '0 1px 6px rgba(28,46,23,0.08)',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '16px',
  fontWeight: 600,
  color: '#1c2e17',
  marginBottom: '14px',
};

export function AccountPage() {
  const navigate = useNavigate();
  const { showConfirm, loading: deleteLoading, error: deleteError, openConfirm, closeConfirm, confirm } = useDeleteAccount();
  const { user, festivals, photos, loading } = useUserHistory();
  const [deletedFestivalIds, setDeletedFestivalIds] = useState<Set<number>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [festivalDeleting, setFestivalDeleting] = useState(false);
  const [festivalDeleteError, setFestivalDeleteError] = useState<string | null>(null);

  const displayedFestivals = festivals.filter((f) => !deletedFestivalIds.has(f.id));
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Set<number>>(new Set());
  const displayedPhotos = photos.filter((p) => !deletedPhotoIds.has(p.id));

  const handlePhotoDelete = async (photoId: number) => {
    setDeletedPhotoIds((prev) => new Set([...prev, photoId]));
    try {
      await deletePhoto(photoId);
    } catch {
      setDeletedPhotoIds((prev) => { const next = new Set(prev); next.delete(photoId); return next; });
    }
  };

  const handleFestivalDelete = async () => {
    if (confirmDeleteId === null) return;
    setFestivalDeleting(true);
    setFestivalDeleteError(null);
    try {
      await deleteFestival(confirmDeleteId);
      setDeletedFestivalIds((prev) => new Set([...prev, confirmDeleteId]));
      setConfirmDeleteId(null);
    } catch {
      setFestivalDeleteError('削除に失敗しました。');
    } finally {
      setFestivalDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', marginBottom: '24px', letterSpacing: '0.04em' }}>
        アカウント
      </h1>

      {/* ユーザー情報 */}
      <div style={sectionCard}>
        <div style={sectionTitle}>アカウント情報</div>
        {loading ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : user ? (
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '6em 1fr', gap: '8px 12px' }}>
            <dt style={{ fontSize: '12px', color: '#7a9470', fontFamily: 'var(--font-body)', fontWeight: 500 }}>ユーザー名</dt>
            <dd style={{ fontSize: '14px', color: '#1c2e17', fontFamily: 'var(--font-body)', margin: 0 }}>{user.username}</dd>
            <dt style={{ fontSize: '12px', color: '#7a9470', fontFamily: 'var(--font-body)', fontWeight: 500 }}>メール</dt>
            <dd style={{ fontSize: '14px', color: '#1c2e17', fontFamily: 'var(--font-body)', margin: 0 }}>{user.email}</dd>
          </dl>
        ) : null}
      </div>

      {/* 投稿した祭り */}
      <div style={sectionCard}>
        <div style={sectionTitle}>投稿した祭り</div>
        {loading ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : displayedFestivals.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '16px 0' }}>
            まだ祭り情報を投稿していません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedFestivals.map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(`/festivals/${f.id}`)}
                style={{
                  background: '#f4f7f0', border: '1px solid #c8d8be', borderRadius: '10px',
                  padding: '12px 14px', cursor: 'pointer', transition: 'box-shadow 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,46,23,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '3px' }}>
                    {f.name}
                  </div>
                  {f.start_datetime && (
                    <div style={{ fontSize: '11px', color: '#7a9470' }}>{f.start_datetime.replace('T', ' ').slice(0, 16)}</div>
                  )}
                  {f.venue && (
                    <div style={{ fontSize: '11px', color: '#7a9470' }}>📍 {f.venue}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/cms/${f.id}`); }}
                    style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                      background: 'white', color: '#4a6840', border: '1px solid #c8d8be',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(f.id); }}
                    style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                      background: 'white', color: '#c85a2c', border: '1px solid #e8a080',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/cms')}
          style={{
            marginTop: '14px', background: '#4e8b3f', color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          ＋ 祭りを投稿する
        </button>
      </div>

      {/* アップロードした写真 */}
      <div style={sectionCard}>
        <div style={sectionTitle}>アップロードした写真</div>
        {loading ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : (
          <PhotoGallery photos={displayedPhotos} onDelete={handlePhotoDelete} />
        )}
      </div>

      {/* 退会 */}
      <div style={{ ...sectionCard, borderColor: '#e8a080' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#c85a2c', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
          退会
        </div>
        <p style={{ fontSize: '12px', color: '#7a9470', marginBottom: '14px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          退会すると、アカウントへのアクセスができなくなります。
        </p>
        <button
          onClick={openConfirm}
          style={{
            background: 'white', color: '#c85a2c', border: '1.5px solid #c85a2c',
            borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}
        >
          退会する
        </button>
      </div>

      {/* 祭り削除確認ダイアログ */}
      {confirmDeleteId !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px 28px',
            width: '100%', maxWidth: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#1c2e17', marginBottom: '12px' }}>
              祭りを削除しますか？
            </div>
            <p style={{ fontSize: '13px', color: '#7a9470', marginBottom: '24px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              削除すると元に戻せません。投稿した写真もあわせて削除されます。
            </p>
            {festivalDeleteError && (
              <p style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px', fontFamily: 'var(--font-body)' }}>{festivalDeleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setConfirmDeleteId(null); setFestivalDeleteError(null); }}
                disabled={festivalDeleting}
                style={{
                  flex: 1, background: 'white', color: '#4a6840',
                  border: '1.5px solid #c8d8be', borderRadius: '8px',
                  padding: '10px', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleFestivalDelete}
                disabled={festivalDeleting}
                style={{
                  flex: 1, background: festivalDeleting ? '#e8a090' : '#c85a2c',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: festivalDeleting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {festivalDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退会確認ダイアログ */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px 28px',
            width: '100%', maxWidth: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#1c2e17', marginBottom: '12px' }}>
              本当に退会しますか？
            </div>
            <p style={{ fontSize: '13px', color: '#7a9470', marginBottom: '24px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              退会するとアカウントにアクセスできなくなります。この操作は取り消せません。
            </p>
            {deleteError && (
              <p style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px', fontFamily: 'var(--font-body)' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeConfirm}
                disabled={deleteLoading}
                style={{
                  flex: 1, background: 'white', color: '#4a6840',
                  border: '1.5px solid #c8d8be', borderRadius: '8px',
                  padding: '10px', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={confirm}
                disabled={deleteLoading}
                style={{
                  flex: 1, background: deleteLoading ? '#e8a090' : '#c85a2c',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {deleteLoading ? '処理中...' : '退会する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
