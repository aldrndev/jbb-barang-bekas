'use client';

import type { UserProfile } from '@jbb/types';
import { useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api-client';
import { toTitleCase } from '../lib/utils';

function normalizeUser(u: UserProfile): UserProfile {
  if (!u) return u;
  return {
    ...u,
    name: toTitleCase(u.name),
    city: u.city ? toTitleCase(u.city) : u.city,
    province: u.province ? toTitleCase(u.province) : u.province,
    bankAccountHolder: u.bankAccountHolder
      ? toTitleCase(u.bankAccountHolder)
      : u.name
        ? toTitleCase(u.name)
        : undefined
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  loginWithGoogle: (data: { credential: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('jbb_auth_token');
    const savedUser = localStorage.getItem('jbb_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser) as UserProfile;
        setUser(normalizeUser(parsed));

        // Sync fresh profile in background (role, KYC, etc.)
        api
          .getMe()
          .then((res) => {
            if (res.success && res.data) {
              const freshUser = normalizeUser(res.data);
              setUser(freshUser);
              localStorage.setItem('jbb_auth_user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {});
      } catch {
        localStorage.removeItem('jbb_auth_token');
        localStorage.removeItem('jbb_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    const normalized = normalizeUser(newUser);
    setToken(newToken);
    setUser(normalized);
    localStorage.setItem('jbb_auth_token', newToken);
    localStorage.setItem('jbb_auth_user', JSON.stringify(normalized));
    setIsAuthModalOpen(false);
    queryClient.invalidateQueries();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jbb_auth_token');
    localStorage.removeItem('jbb_auth_user');
    queryClient.clear();
  };

  const loginWithGoogle = async (data: { credential: string }) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(data);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: res.error?.message || 'Gagal login dengan Google' };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal autentikasi Google';
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        logout,
        loginWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
