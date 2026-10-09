import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getCurrentUserApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('safecity_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('safecity_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  const logout = (reason = null) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('safecity_token');
    localStorage.removeItem('safecity_user');
    if (reason) {
      setSessionError(reason);
    }
  };

  useEffect(() => {
    const handleAuthExpired = (event) => {
      const msg = event?.detail?.message || 'Your login session has expired. Please log in again.';
      logout(msg);
    };

    window.addEventListener('safecity:auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('safecity:auth-expired', handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    const verifyUserSession = async () => {
      if (token) {
        try {
          const freshUser = await getCurrentUserApi();
          setUser(freshUser);
          localStorage.setItem('safecity_user', JSON.stringify(freshUser));
        } catch (err) {
          // Token invalid/expired or user wiped from DB
          logout('Your session has expired or the backend database was restarted. Please log in again.');
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, [token]);

  const login = async (email, password) => {
    setSessionError(null);
    const response = await loginApi(email, password);
    const { token: jwtToken, user: userProfile } = response;

    setToken(jwtToken);
    setUser(userProfile);

    localStorage.setItem('safecity_token', jwtToken);
    localStorage.setItem('safecity_user', JSON.stringify(userProfile));

    return userProfile;
  };

  const register = async (formData) => {
    setSessionError(null);
    const response = await registerApi(formData);
    const { token: jwtToken, user: userProfile } = response;

    setToken(jwtToken);
    setUser(userProfile);

    localStorage.setItem('safecity_token', jwtToken);
    localStorage.setItem('safecity_user', JSON.stringify(userProfile));

    return userProfile;
  };

  const clearSessionError = () => {
    setSessionError(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    sessionError,
    setSessionError,
    clearSessionError,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

