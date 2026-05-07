/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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

async function ensureProfile(userId: string, email?: string): Promise<Profile | null> {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    return existing as Profile;
  }

  if (fetchError) {
    console.error('Erro ao buscar perfil:', fetchError);
    return null;
  }

  // Profile doesn't exist — create one automatically
  const newProfile = {
    id: userId,
    email: email || '',
    full_name: '',
    company_name: '',
    cnpj: '',
    phone: '',
    customer_type: '',
    city: '',
    state: '',
    role: 'b2b_pending' as const,
  };

  const { error: insertError } = await supabase.from('profiles').insert([newProfile]);

  if (insertError) {
    console.error('Erro ao criar perfil automaticamente:', insertError);
    return null;
  }

  return newProfile as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User) => {
    const p = await ensureProfile(u.id, u.email);
    setProfile(p);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (data: SignUpData): Promise<string | null> => {
    const { error: signUpError, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) return signUpError.message;
    if (!authData.user) return 'Erro ao criar usuário.';

    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        company_name: data.companyName,
        cnpj: data.cnpj,
        phone: data.phone,
        customer_type: data.customerType,
        city: data.city,
        state: data.state,
        role: 'b2b_pending',
      },
    ]);

    if (profileError) {
      console.error('Erro ao criar perfil no cadastro:', profileError);
      return 'Erro ao criar perfil. Verifique se a tabela profiles existe no Supabase.';
    }

    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await ensureProfile(user.id, user.email);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn: !!user,
        isAdmin: profile?.role === 'admin',
        isB2BApproved: profile?.role === 'b2b_approved',
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
