import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';

export default function AdminRoute({ children }) {
  const { data: user, isLoading } = useMe();
  const location = useLocation();

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}