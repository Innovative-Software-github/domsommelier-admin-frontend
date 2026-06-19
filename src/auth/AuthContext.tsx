import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getProfile } from '../api/customer/requests';
import type { CustomerProfile } from '../api/customer/interfaces';
import { ForbiddenAccessError } from './errors';
import { isAdmin } from './roles';
import { tokenStorage } from './tokenStorage';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  profile: CustomerProfile | null;
  isAdmin: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadAdminProfile(): Promise<CustomerProfile> {
  const profile = await getProfile();

  if (!isAdmin(profile.role)) {
    throw new ForbiddenAccessError();
  }

  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setProfile(null);
    setStatus('unauthenticated');
  }, []);

  const loginWithToken = useCallback(async (token: string) => {
    tokenStorage.setToken(token);

    try {
      const adminProfile = await loadAdminProfile();
      setProfile(adminProfile);
      setStatus('authenticated');
    } catch (error) {
      tokenStorage.removeToken();
      setProfile(null);
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = tokenStorage.getToken();

    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;

    loadAdminProfile()
      .then((adminProfile) => {
        if (cancelled) return;
        setProfile(adminProfile);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        tokenStorage.removeToken();
        setProfile(null);
        setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      profile,
      isAdmin: profile !== null,
      loginWithToken,
      logout,
    }),
    [status, profile, loginWithToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
