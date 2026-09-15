import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { APP_NAME, ROLE_LABELS, ROLE_HOME } from '../../utils/constants';
import { initials } from '../../utils/formatters';
import BrandMark from './BrandMark';

export default function Navbar({ onToggleSidebar, showToggle }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const home = isAuthenticated ? ROLE_HOME[user.role] : '/';
  const profilePath = isAuthenticated ? `/${user.role.toLowerCase()}/profile` : '/login';

  return (
    <nav className="cp-navbar sticky-top">
      <div className="d-flex align-items-center px-3" style={{ height: 62 }}>
        {showToggle && (
          <button className="btn btn-sm btn-light d-lg-none me-2" onClick={onToggleSidebar} aria-label="Toggle menu">
            <i className="bi bi-list fs-5" />
          </button>
        )}
        <Link to={home} className="cp-brand">
          <BrandMark />
          {APP_NAME}
        </Link>

        <div className="ms-auto d-flex align-items-center gap-2" ref={menuRef}>
          {isAuthenticated ? (
            <div className="position-relative">
              <button className="btn btn-light d-flex align-items-center gap-2 py-1 ps-1 pe-2" onClick={() => setMenuOpen((o) => !o)} style={{ borderRadius: 999 }}>
                <span className="avatar" style={{ width: 32, height: 32, fontSize: '0.78rem' }}>{initials(user.fullName)}</span>
                <span className="d-none d-sm-block text-start lh-1">
                  <span className="d-block fw-semibold" style={{ fontSize: '0.85rem' }}>{user.fullName}</span>
                  <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>{ROLE_LABELS[user.role]}</span>
                </span>
                <i className="bi bi-chevron-down small text-muted" />
              </button>
              {menuOpen && (
                <div className="card shadow position-absolute end-0 mt-2 py-1" style={{ minWidth: 200, zIndex: 1080 }}>
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-semibold text-truncate">{user.fullName}</div>
                    <div className="small text-muted text-truncate">{user.email}</div>
                  </div>
                  <button className="dropdown-item px-3 py-2 text-start border-0 bg-transparent" onClick={() => { setMenuOpen(false); navigate(profilePath); }}>
                    <i className="bi bi-person me-2" />My Profile
                  </button>
                  <button className="dropdown-item px-3 py-2 text-start border-0 bg-transparent text-danger" onClick={() => { logout(); navigate('/login'); }}>
                    <i className="bi bi-box-arrow-right me-2" />Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/track" className="btn btn-light btn-sm">Track a complaint</Link>
              <Link to="/login" className="btn btn-outline-primary btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
