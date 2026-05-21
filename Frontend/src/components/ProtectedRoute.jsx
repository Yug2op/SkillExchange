// Frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';
import BrandLoader from './BrandLoader';

export default function ProtectedRoute({ children }) {
  const { data: user, isLoading, isError } = useMe();
  const location = useLocation();

  if (isLoading)
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <BrandLoader />
      </div>
    );
  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}