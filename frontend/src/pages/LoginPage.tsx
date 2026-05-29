import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #c8d8be',
  borderRadius: '10px',
  padding: '11px 13px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1c2e17',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#4a6840',
  marginBottom: '6px',
  letterSpacing: '0.02em',
};

export function LoginPage() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/cms');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f7f0',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(28,46,23,0.13)',
        width: '100%',
        maxWidth: '380px',
        overflow: 'hidden',
      }}>
        {/* ブランドヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, #2d5422 0%, #4e8b3f 100%)',
          padding: '28px 36px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '22px' }}>🏮</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '0.08em',
          }}>
            MatsuRipple
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', marginTop: '4px', fontFamily: 'var(--font-body)' }}>
            ログインして祭りを管理
          </div>
        </div>

        {/* フォーム */}
        <div style={{ padding: '28px 32px 32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>メールアドレス</label>
              <input
                style={inputStyle}
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='example@email.com'
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>パスワード</label>
              <input
                style={inputStyle}
                type='password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
              />
            </div>
            {error && (
              <div style={{
                fontSize: '12px',
                color: '#c85a2c',
                background: '#fff3ef',
                border: '1px solid #f0c0a0',
                borderRadius: '8px',
                padding: '9px 12px',
                marginBottom: '16px',
                fontFamily: 'var(--font-body)',
              }}>
                {error}
              </div>
            )}
            <button
              type='submit'
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ab88e' : '#4e8b3f',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.03em',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            paddingTop: '18px',
            borderTop: '1px solid #e4eddf',
            textAlign: 'center',
            fontSize: '12px',
            color: '#7a9470',
            fontFamily: 'var(--font-body)',
          }}>
            アカウントをお持ちでない方は{' '}
            <Link to='/register' style={{ color: '#c85a2c', textDecoration: 'none', fontWeight: 700 }}>
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
