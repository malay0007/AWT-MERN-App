import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) =>
    location.pathname === path
      ? { color: 'var(--purple)', borderBottom: '2px solid var(--purple)', paddingBottom: '2px' }
      : {};

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">AWT<span>Quiz</span></Link>
      <div className="navbar-links">
        {user?.role === 'admin' ? (
          <>
            <Link to="/admin" className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px', ...isActive('/admin') }}>Dashboard</Link>
            <Link to="/admin/questions" className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px', ...isActive('/admin/questions') }}>Questions</Link>
            <Link to="/admin/scores"    className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px', ...isActive('/admin/scores') }}>Scores</Link>
          </>
        ) : (
          <>
            <Link to="/"            className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px' }}>Home</Link>
            <Link to="/leaderboard" className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px' }}>Leaderboard</Link>
          </>
        )}
        <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '4px' }}>{user?.name}</span>
        <button className="btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '13px' }}>Logout</button>
      </div>
    </nav>
  );
}
