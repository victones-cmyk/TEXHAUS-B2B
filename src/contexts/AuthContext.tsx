/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, setToken, getToken } from '../lib/api';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  cnpj: string;
  phone: string;
  customer_type: string;
  city: string;
  state: string;
  role: 'admin' | 'b2b_pending' | 'b2b_approved' | 'b2b_rejected';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  cnpj: string;
  phone: string;
  customerType: string;
  city: string;
  state: string;
  cep: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isB2BApproved: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (data: SignUpData) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoggedIn: false,
  isAdmin: false,
  isB2BApproved: false,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const p = await api<Profile>('/auth/me');
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      api<User>('/auth/me')
        .then((u) => {
          setUser(u);
          return loadProfile();
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          setProfile(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      const data = await api<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      await loadProfile();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Erro ao fazer login';
    }
  };

  const signUp = async (data: SignUpData): Promise<string | null> => {
    try {
      const res = await api<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setToken(res.token);
      setUser(res.user);
      await loadProfile();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Erro ao cadastrar';
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn: !!user,
        isAdmin: profile?.role === 'admin',
        isB2BApproved: profile?.role === 'b2b_approved' || profile?.role === 'admin',
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
