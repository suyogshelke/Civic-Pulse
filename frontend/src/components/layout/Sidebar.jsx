import { NavLink } from 'react-router-dom';
import { NAV } from './navConfig';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';

export default function Sidebar({ open, onNavigate }) {
  const { role } = useAuth();
  const items = NAV[role] || [];

  return (
    <aside className={`cp-sidebar ${open ? 'open' : ''}`}>
      <div className="px-2 mb-2 d-lg-none">
        <span className="badge badge-soft">{ROLE_LABELS[role]} portal</span>
      </div>
      <nav>
        {items.map((item, i) =>
          item.section ? (
            <div key={`s-${i}`} className="nav-section">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onNavigate}
              end
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
      <div className="mt-4 px-2">
        <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="cp-eyebrow mb-1" style={{ color: '#4dd0e1' }}>Need help?</div>
          <p className="small mb-0" style={{ color: '#9db4cf' }}>
            Call the civic helpline <strong className="text-white">1800-CIVIC</strong> for urgent issues.
          </p>
        </div>
      </div>
    </aside>
  );
}
