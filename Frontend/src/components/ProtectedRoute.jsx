// Frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';

export default function ProtectedRoute({ children }) {
  const { data: user, isLoading, isError } = useMe();
  const location = useLocation();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}