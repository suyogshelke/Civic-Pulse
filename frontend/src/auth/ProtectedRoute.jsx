/** Route guard: requires authentication and (optionally) a specific role. */

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROLE_HOME } from '../utils/constants';
import Loader from '../components/common/Loader';

export default function ProtectedRoute({ allow }) {
  const { isAuthenticated, role, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <Loader full label="Preparing your workspace…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allow && !allow.includes(role)) {
    // Signed in but wrong portal — send them to their own home.
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return <Outlet />;
}
