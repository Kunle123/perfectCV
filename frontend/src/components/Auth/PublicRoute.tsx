import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = localStorage.getItem('token');

  // If the user is already authenticated, redirect to the dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute; 