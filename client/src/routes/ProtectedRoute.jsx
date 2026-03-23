import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
