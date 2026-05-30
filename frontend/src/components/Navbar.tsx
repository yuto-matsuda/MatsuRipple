import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: '地図' },
    { to: '/photos', label: '写真' },
    ...(isAuthenticated ? [{ to: '/cms', label: '祭り投稿' }, { to: '/groups', label: 'グループ' }] : []),
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('nav')) setMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  // ルート変更時にメニューを閉じる
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <nav style={{
      background: '#2d5422',
      color: 'white',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '52px',
      boxShadow: '0 2px 8px rgba(28,46,23,0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* ロゴ */}
      <Link to="/" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '17px',
        fontWeight: 700,
        color: 'white',
        textDecoration: 'none',
        letterSpacing: '0.06em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
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

      {/* デスクトップナビ（md以上で表示） */}
      <div className="hidden md:flex gap-5 items-center">
        {links.map(({ to, label }) => (
          <Link key={to} to={to} style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: isActive(to) ? 'white' : 'rgba(255,255,255,0.72)',
            textDecoration: 'none',
            borderBottom: isActive(to) ? '2px solid #c85a2c' : '2px solid transparent',
            paddingBottom: '2px',
            transition: 'color 0.2s',
          }}>
            {label}
          </Link>
        ))}
        {isAuthenticated ? (
          <>
            <Link to="/account" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>アカウント</Link>
            <button onClick={handleLogout} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.72)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>ログアウト</button>
          </>
        ) : (
          <Link to="/login" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', background: '#c85a2c', color: 'white', textDecoration: 'none' }}>ログイン</Link>
        )}
      </div>

      {/* ハンバーガーボタン（md未満で表示） */}
      <button
        className="md:hidden flex items-center justify-center text-white cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ background: 'none', border: 'none', padding: '4px' }}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* モバイルドロップダウン */}
      {menuOpen && (
        <div className="md:hidden" style={{
          position: 'fixed', top: '52px', left: 0, right: 0,
          background: '#2d5422', zIndex: 200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'block',
                padding: '14px 24px',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive(to) ? 700 : 500,
                color: isActive(to) ? 'white' : 'rgba(255,255,255,0.82)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.10)',
                borderLeft: isActive(to) ? '3px solid #c85a2c' : '3px solid transparent',
              }}
            >
              {label}
            </Link>
          ))}
          <div style={{ padding: '12px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Link to="/account" style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.82)', textDecoration: 'none' }}>アカウント</Link>
                <button onClick={handleLogout} style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.72)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>ログアウト</button>
              </>
            ) : (
              <Link to="/login" style={{ fontSize: '13px', fontFamily: 'var(--font-body)', padding: '7px 18px', borderRadius: '8px', background: '#c85a2c', color: 'white', textDecoration: 'none' }}>ログイン</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
