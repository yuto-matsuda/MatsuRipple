import useDeleteAccount from '../hooks/useDeleteAccount';

export function AccountPage() {
  const { showConfirm, loading, error, openConfirm, closeConfirm, confirm } = useDeleteAccount();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f0' }}>
      <div style={{
        background: 'white', border: '1px solid #c8d8be', borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(28,46,23,0.10)', padding: '40px 36px', width: '100%', maxWidth: '360px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.06em' }}>
            アカウント
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e8f0e4', paddingTop: '24px', marginTop: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#c85a2c', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
            退会
          </div>
          <p style={{ fontSize: '12px', color: '#7a9470', marginBottom: '16px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            退会すると、アカウントへのアクセスができなくなります。
          </p>
          <button
            onClick={openConfirm}
            style={{
              width: '100%', background: 'white', color: '#c85a2c',
              border: '1.5px solid #c85a2c', borderRadius: '8px',
              padding: '10px', fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            退会する
          </button>
        </div>
      </div>

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
            {error && (
              <p style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px', fontFamily: 'var(--font-body)' }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeConfirm}
                disabled={loading}
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
                disabled={loading}
                style={{
                  flex: 1, background: loading ? '#e8a090' : '#c85a2c',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? '処理中...' : '退会する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
