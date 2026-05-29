import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeleteAccount from '../hooks/useDeleteAccount';
import useUserHistory from '../hooks/useUserHistory';
import { PhotoGallery } from '../components/PhotoGallery';

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
  marginBottom: '14px',
  letterSpacing: '0.02em',
};

export function AccountPage() {
  const navigate = useNavigate();
  const { showConfirm, loading: deleteLoading, error: deleteError, openConfirm, closeConfirm, confirm } = useDeleteAccount();
  const { user, festivals, photos, loading } = useUserHistory();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 48px', background: '#f4f7f0', minHeight: '100vh' }}>

      {/* ページタイトル */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', margin: 0, letterSpacing: '0.04em' }}>
          アカウント
        </h1>
      </div>

      {/* ユーザー情報 */}
      <div style={sectionCard}>
        <div style={sectionTitle}>アカウント情報</div>
        {loading ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* アバター */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4e8b3f 0%, #2d5422 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
              fontFamily: 'var(--font-display)',
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '6em 1fr', gap: '5px 12px', flex: 1 }}>
              <dt style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)', fontWeight: 600, alignSelf: 'center' }}>ユーザー名</dt>
              <dd style={{ fontSize: '14px', fontWeight: 600, color: '#1c2e17', fontFamily: 'var(--font-body)', margin: 0 }}>{user.username}</dd>
              <dt style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)', fontWeight: 600, alignSelf: 'center' }}>メール</dt>
              <dd style={{ fontSize: '13px', color: '#4a6840', fontFamily: 'var(--font-body)', margin: 0 }}>{user.email}</dd>
            </dl>
          </div>
        ) : null}
      </div>

      {/* 投稿した祭り */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={sectionTitle}>投稿した祭り</div>
          {festivals.length > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'white',
              background: '#4e8b3f',
              borderRadius: '10px',
              padding: '2px 9px',
              fontFamily: 'var(--font-body)',
            }}>
              {festivals.length}件
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : festivals.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '20px 0' }}>
            まだ祭り情報を投稿していません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {festivals.map((f) => (
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
                  borderRadius: '12px',
                  padding: '11px 14px',
                  cursor: 'pointer',
                  boxShadow: hoveredId === f.id ? '0 4px 14px rgba(28,46,23,0.10)' : '0 1px 4px rgba(28,46,23,0.06)',
                  transform: hoveredId === f.id ? 'translateY(-1px)' : 'translateY(0)',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {f.region && (
                    <div style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#c85a2c',
                      background: '#fff0e8',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      marginBottom: '4px',
                    }}>
                      {f.region}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#1c2e17', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </div>
                  {f.start_datetime && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#c85a2c', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span>📅</span>{f.start_datetime.replace('T', ' ').slice(0, 16)}
                    </div>
                  )}
                  {f.venue && (
                    <div style={{ fontSize: '11px', color: '#7a9470', marginTop: '2px' }}>📍 {f.venue}</div>
                  )}
                </div>
                {f.thumbnail_url && (
                  <img
                    src={f.thumbnail_url}
                    alt={f.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #e4eddf' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/cms')}
          style={{
            background: '#4e8b3f',
            color: 'white',
            border: 'none',
            borderRadius: '9px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
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
          <PhotoGallery photos={photos} />
        )}
      </div>

      {/* 退会 */}
      <div style={{ ...sectionCard, borderColor: '#f0c0a0', background: '#fffaf8' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#c85a2c', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
          退会
        </div>
        <p style={{ fontSize: '12px', color: '#7a9470', marginBottom: '14px', fontFamily: 'var(--font-body)', lineHeight: 1.7, margin: '0 0 14px' }}>
          退会すると、アカウントへのアクセスができなくなります。
        </p>
        <button
          onClick={openConfirm}
          style={{
            background: 'white',
            color: '#c85a2c',
            border: '1.5px solid #c85a2c',
            borderRadius: '9px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          退会する
        </button>
      </div>

      {/* 退会確認ダイアログ */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,20,10,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 28px',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.20)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#1c2e17', marginBottom: '10px' }}>
              本当に退会しますか？
            </div>
            <p style={{ fontSize: '13px', color: '#7a9470', marginBottom: '24px', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
              退会するとアカウントにアクセスできなくなります。この操作は取り消せません。
            </p>
            {deleteError && (
              <p style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px', fontFamily: 'var(--font-body)' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={closeConfirm}
                disabled={deleteLoading}
                style={{
                  flex: 1,
                  background: '#f4f7f0',
                  color: '#4a6840',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={confirm}
                disabled={deleteLoading}
                style={{
                  flex: 1,
                  background: deleteLoading ? '#e8a090' : '#c85a2c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
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
