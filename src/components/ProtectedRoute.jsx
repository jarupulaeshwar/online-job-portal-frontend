import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROLE_HOME, useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

/**
 * Wraps pages that need a login. If "roles" is given, only those roles may enter;
 * everybody else is sent to their own dashboard. (The backend enforces this again.)
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return <Outlet />;
}
