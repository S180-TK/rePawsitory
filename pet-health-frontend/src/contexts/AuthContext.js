import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper function to get token directly from localStorage
// This ensures we always have the most current token, even during state transitions
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [sessionId, setSessionId] = useState(0);

  // Restore on refresh and react to login/logout in another tab.
  useEffect(() => {
    const restore = () => {
      const storedToken = localStorage.getItem('token');
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        // Invalid persisted state is treated as a signed-out session.
      }
      const valid = storedToken && (storedUser?.id || storedUser?._id) &&
        ['owner', 'pet_owner', 'vet', 'veterinarian', 'admin'].includes(storedUser?.role);
      setToken(valid ? storedToken : null);
      setUser(valid ? storedUser : null);
      setIsAuthenticated(Boolean(valid));
      setSessionId(value => value + 1);
      setIsLoading(false);
    };
    restore();
    const onStorage = event => {
      if (event.key === null || event.key === 'token' || event.key === 'user') restore();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setSessionId(value => value + 1);
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSessionId(value => value + 1);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    sessionId,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken: getStoredToken // Include helper in context
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
