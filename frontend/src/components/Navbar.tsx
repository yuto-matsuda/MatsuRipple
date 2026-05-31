import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle } from 'lucide-react';
import { fetchMe } from '../api/auth';
import type { UserResponse } from '../types/user';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);

  const links = [
    { to: '/', label: '地図' },
    ...(isAuthenticated ? [{ to: '/cms', label: '祭り投稿' }, { to: '/groups', label: 'グループ' }, { to: '/me', label: 'マイページ' }] : []),
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (!isAuthenticated) { setUser(null); return; }
    fetchMe().then(setUser).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const Logo = (
    <Link to="/" style={{
      fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700,
      color: 'white', textDecoration: 'none', letterSpacing: '0.06em',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="28" height="28" aria-hidden="true" style={{ flexShrink: 0 }}>
        <g fill="none" stroke="#E6592E" strokeWidth="2.6">
          <circle cx="44" cy="44" r="40" strokeOpacity="0.26" />
          <circle cx="44" cy="44" r="31" strokeOpacity="0.45" />
          <circle cx="44" cy="44" r="22" strokeOpacity="0.66" />
        </g>
        <g fill="#E6592E" transform="translate(44 44) scale(0.6) translate(-44 -44)">
          <path d="M44,44 C30,38 32,19 50,11 C56,21 53,38 44,44 Z" transform="rotate(0 44 44)" />
          <path d="M44,44 C30,38 32,19 50,11 C56,21 53,38 44,44 Z" transform="rotate(120 44 44)" />
          <path d="M44,44 C30,38 32,19 50,11 C56,21 53,38 44,44 Z" transform="rotate(240 44 44)" />
        </g>
      </svg>
      MatsuRipple
    </Link>
  );

  return (
    <>
      <nav style={{
        background: '#2d5422', color: 'white', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '52px', boxShadow: '0 2px 8px rgba(28,46,23,0.18)',
        position: 'sticky', top: 0, zIndex:100,
      }}>
        {Logo}

        {/* デスクトップナビ */}
        <div className="hidden md:flex gap-5 items-center">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
              color: isActive(to) ? 'white' : 'rgba(255,255,255,0.72)',
              textDecoration: 'none',
              borderBottom: isActive(to) ? '2px solid #c85a2c' : '2px solid transparent',
              paddingBottom: '2px', transition: 'color 0.2s',
            }}>
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.72)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>ログアウト</button>
          ) : (
            <Link to="/login" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', background: '#c85a2c', color: 'white', textDecoration: 'none' }}>ログイン</Link>
          )}
        </div>

        {/* ハンバーガーボタン（モバイルのみ） */}
        <button
          className="md:hidden flex items-center justify-center text-white cursor-pointer"
          onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', padding: '4px' }}
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* バックドロップ */}
      <div
        className={`md:hidden fixed inset-0 transition-opacity duration-280 ease-in-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
        onClick={() => setMenuOpen(false)}
      />

      {/* 左スライドドロワー */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 flex flex-col bg-white transition-transform duration-280 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 'min(80vw, 300px)', zIndex: 300, boxShadow: '4px 0 24px rgba(0,0,0,0.18)' }}
      >
        {/* 閉じるボタン */}
        <div className="flex justify-end p-3 shrink-0" style={{ borderBottom: '1px solid #e4eddf' }}>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            <X size={22} color="#4a6840" />
          </button>
        </div>

        {/* アカウントセクション */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #e4eddf' }}>
          {isAuthenticated && user ? (
            <>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4e8b3f 0%, #2d5422 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 700, color: 'white', flexShrink: 0,
                fontFamily: 'var(--font-display)',
              }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c2e17', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
                <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </>
          ) : (
            <>
              <UserCircle size={48} color="#9ab88e" strokeWidth={1.5} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#7a9470', fontFamily: 'var(--font-body)' }}>ゲスト</div>
            </>
          )}
        </div>

        {/* ナビリンク */}
        <div className="flex flex-col flex-1 overflow-y-auto py-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'block', padding: '13px 20px',
                fontSize: '14px', fontFamily: 'var(--font-body)',
                fontWeight: isActive(to) ? 700 : 500,
                color: isActive(to) ? '#1c2e17' : '#4a6840',
                textDecoration: 'none',
                background: isActive(to) ? '#f4f7f0' : 'transparent',
                borderLeft: `3px solid ${isActive(to) ? '#c85a2c' : 'transparent'}`,
                transition: 'background 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* 下部：ログアウト */}
        <div className="shrink-0 px-5 py-4 flex flex-col gap-3" style={{ borderTop: '1px solid #e4eddf' }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: '#c85a2c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 600 }}
            >
              ログアウト
            </button>
          ) : (
            <Link
              to="/login"
              style={{ display: 'block', textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-body)', padding: '10px', borderRadius: '8px', background: '#c85a2c', color: 'white', textDecoration: 'none', fontWeight: 600 }}
            >
              ログイン
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
