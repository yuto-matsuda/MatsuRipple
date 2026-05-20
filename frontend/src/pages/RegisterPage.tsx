import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useRegister from '../hooks/useRegister';

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

const errorStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#c85a2c',
  marginTop: '4px',
};

export function RegisterPage() {
  const { register, loading, serverError, validationErrors } = useRegister();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const ok = await register({ username, email, password });
    if (ok) navigate('/login');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f0' }}>
      <div style={{
        background: 'white', border: '1px solid #c8d8be', borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(28,46,23,0.10)', padding: '40px 36px', width: '100%', maxWidth: '360px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.06em' }}>
            アカウント作成
          </div>
          <div style={{ fontSize: '13px', color: '#7a9470', marginTop: '6px', fontFamily: 'var(--font-body)' }}>
            MatsuRipple に登録
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>
              ユーザー名
            </label>
            <input
              style={inputStyle}
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yamada_taro"
            />
            {validationErrors.username && <p style={errorStyle}>{validationErrors.username}</p>}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>
              メールアドレス
            </label>
            <input
              style={inputStyle}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
            {validationErrors.email && <p style={errorStyle}>{validationErrors.email}</p>}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>
              パスワード（8文字以上）
            </label>
            <input
              style={inputStyle}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {validationErrors.password && <p style={errorStyle}>{validationErrors.password}</p>}
          </div>
          {serverError && (
            <div style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px' }}>{serverError}</div>
          )}
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
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#7a9470', marginTop: '20px', fontFamily: 'var(--font-body)' }}>
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" style={{ color: '#4e8b3f', textDecoration: 'none', fontWeight: 600 }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
