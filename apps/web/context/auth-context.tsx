'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '@jbb/types';
import { api } from '../lib/api-client';
import { toTitleCase } from '../lib/utils';

function normalizeUser(u: UserProfile): UserProfile {
  if (!u) return u;
  return {
    ...u,
    name: toTitleCase(u.name),
    city: u.city ? toTitleCase(u.city) : u.city,
    province: u.province ? toTitleCase(u.province) : u.province,
    bankAccountHolder: u.bankAccountHolder ? toTitleCase(u.bankAccountHolder) : (u.name ? toTitleCase(u.name) : undefined)
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
  loginWithGoogle: (data: { credential?: string; email?: string; name?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoBuyer: () => Promise<void>;
  loginAsDemoSeller: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
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
        const parsed = JSON.parse(savedUser);
        setUser(normalizeUser(parsed));
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

  const loginWithGoogle = async (data: { credential?: string; email?: string; name?: string; avatarUrl?: string }) => {
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
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Gagal autentikasi Google' };
    }
  };

  const loginAsDemoBuyer = async () => {
    const res = await api.login('dimas.ardi@example.com', 'password123');
    if (res.success && res.data) {
      login(res.data.token, res.data.user);
    }
  };

  const loginAsDemoSeller = async () => {
    const res = await api.login('budi.gadget@example.com', 'password123');
    if (res.success && res.data) {
      login(res.data.token, res.data.user);
    }
  };

  const loginAsDemoAdmin = async () => {
    const adminUser: UserProfile = {
      id: 'usr-admin-master',
      name: 'Administrator Rekber Peygo',
      email: 'admin.rekber@peygo.id',
      phone: '081199887766',
      role: 'ADMIN',
      isKycVerified: true,
      isPhoneVerified: true,
      trustScore: 100,
      totalTransactions: 999,
      ratingAverage: 5.0,
      ratingCount: 500,
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      bio: 'Master Administrator & Escrow Dispute Resolution Officer Rekber Peygo.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-01-01T00:00:00Z'
    };
    login('admin_master_secret_jwt_token', adminUser);
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
        loginWithGoogle,
        loginAsDemoBuyer,
        loginAsDemoSeller,
        loginAsDemoAdmin
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
