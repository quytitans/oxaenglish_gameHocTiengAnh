import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.brand}>
        <span style={styles.logoBadge}>OX</span>
        <span style={styles.brandText}>OXA English</span>
      </Link>
      <nav style={styles.nav}>
        {user.role === 'admin' && (
          <Link to="/admin" style={styles.link}>
            Quản lý tài khoản
          </Link>
        )}
        <span style={styles.userTag}>{user.username}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid var(--color-border)',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--color-primary-dark)',
    textDecoration: 'none',
  },
  logoBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 9,
    background: 'var(--color-primary)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: -0.5,
    flexShrink: 0,
  },
  brandText: {
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    color: 'var(--color-text)',
  },
  userTag: {
    fontSize: 14,
    color: 'var(--color-text-muted)',
  },
};
