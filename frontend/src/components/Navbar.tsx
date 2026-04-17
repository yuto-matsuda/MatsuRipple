import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-red-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">
        MatsuRipple
      </Link>
      <div className="flex gap-5 items-center text-sm">
        <Link to="/" className="hover:text-red-200 transition-colors">地図</Link>
        <Link to="/photos" className="hover:text-red-200 transition-colors">写真</Link>
        {isAuthenticated ? (
          <>
            <Link to="/cms" className="hover:text-red-200 transition-colors">祭り投稿</Link>
            <button onClick={handleLogout} className="hover:text-red-200 transition-colors">
              ログアウト
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-red-200 transition-colors">ログイン</Link>
        )}
      </div>
    </nav>
  );
}
