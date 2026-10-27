import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { login as loginRequest, logout as logoutRequest } from '@/services/resources';
import { refreshAccessToken, setAccessToken, setUnauthorizedHandler } from '@/services/http';
import type { PublicUser } from '@/types/api';

interface AuthState {
  user: PublicUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    refreshAccessToken()
      .then(async (token) => {
        if (!active || !token) return;
        const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!response.ok) return;
        const profile = (await response.json()) as PublicUser;
        if (active) setUser(profile);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      login: async (email, password) => {
        const session = await loginRequest(email, password);
        setAccessToken(session.accessToken);
        setUser(session.user);
      },
      logout: async () => {
        await logoutRequest();
        setAccessToken(null);
        setUser(null);
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
