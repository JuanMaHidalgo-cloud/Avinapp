import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow both broker_admin and super_admin to access admin routes
  // Specific pages (like SuperAdminPage) will do their own strict role check
  if (currentUser?.role !== 'broker_admin' && currentUser?.role !== 'super_admin') {
    return <Navigate to="/policies" replace />;
  }

  return children;
};

export default AdminRoute;