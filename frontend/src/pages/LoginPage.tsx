import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #c8d8be',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1c2e17',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
};

export function LoginPage() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) navigate('/cms');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f0' }}>
      <div style={{
        background: 'white', border: '1px solid #c8d8be', borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(28,46,23,0.10)', padding: '40px 36px', width: '100%', maxWidth: '360px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.06em' }}>
            ログイン
          </div>
          <div style={{ fontSize: '13px', color: '#7a9470', marginTop: '6px', fontFamily: 'var(--font-body)' }}>
            MatsuRipple 管理者
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>
              ユーザー名
            </label>
            <input style={inputStyle} type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>
              パスワード
            </label>
            <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#9ab88e' : '#4e8b3f',
              color: 'white', border: 'none', borderRadius: '8px',
              padding: '11px', fontSize: '14px', fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#7a9470', marginTop: '20px', fontFamily: 'var(--font-body)' }}>
          アカウントは管理者にお問い合わせください
        </p>
      </div>
    </div>
  );
}
