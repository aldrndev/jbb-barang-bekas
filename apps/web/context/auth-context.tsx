'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '@jbb/types';
import { api } from '../lib/api-client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
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
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('jbb_auth_token');
        localStorage.removeItem('jbb_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('jbb_auth_token', newToken);
    localStorage.setItem('jbb_auth_user', JSON.stringify(newUser));
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
      name: 'Administrator Rekber JBB',
      email: 'admin.rekber@jbb-marketplace.id',
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
      bio: 'Master Administrator & Escrow Dispute Resolution Officer Rekber JBB.',
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
