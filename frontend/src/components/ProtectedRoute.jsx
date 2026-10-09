import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          sessionExpired: true,
          message: 'Your login session has expired or the server database was restarted. Please log in again.',
        }}
        replace
      />
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect user to their own role dashboard if trying to access unauthorized route
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'RESPONDER') return <Navigate to="/responder" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return children;
};

export default ProtectedRoute;
