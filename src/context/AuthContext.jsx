import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/index.js';
import { clearToken, getToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export const ROLE_HOME = {
  JOB_SEEKER: '/seeker',
  RECRUITER: '/recruiter',
  ADMIN: '/admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Restore the session after a browser refresh.
  useEffect(() => {
    if (!getToken()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // The API client fires this event when the server rejects the token.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const handleAuth = useCallback((response) => {
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const login = useCallback((credentials) => authApi.login(credentials).then(handleAuth), [handleAuth]);
  const registerSeeker = useCallback((body) => authApi.registerSeeker(body).then(handleAuth), [handleAuth]);
  const registerRecruiter = useCallback((body) => authApi.registerRecruiter(body).then(handleAuth), [handleAuth]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, registerSeeker, registerRecruiter, logout }),
    [user, loading, login, registerSeeker, registerRecruiter, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
