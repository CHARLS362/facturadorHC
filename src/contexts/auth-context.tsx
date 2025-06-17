"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email?: string; name?: string } | null;
  login: (email: string, rememberMe: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('facturacionhc_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.user) {
          setIsAuthenticated(true);
          setUser(authData.user);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('facturacionhc_auth');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && pathname === '/login') {
        router.push('/dashboard');
      } else if (!isAuthenticated && pathname.startsWith('/dashboard')) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = useCallback((email: string, rememberMe: boolean) => {
    const userData = { email, name: email.split('@')[0] }; // Simple name generation
    setIsAuthenticated(true);
    setUser(userData);
    if (rememberMe) {
      try {
        localStorage.setItem('facturacionhc_auth', JSON.stringify({ isAuthenticated: true, user: userData }));
      } catch (error) {
        console.error("Failed to save auth data to localStorage", error);
      }
    }
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('facturacionhc_auth');
    } catch (error) {
      console.error("Failed to remove auth data from localStorage", error);
    }
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
