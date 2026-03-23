import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

function RoleRoute({ roles = [], children }) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || (roles.length && !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;
