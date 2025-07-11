"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email?: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (loginData: any, rememberMe: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Role ID to Role Name
const getRoleFromId = (roleId?: number): string => {
  switch (roleId) {
    case 1: return 'Admin';
    case 2: return 'Vendedor';
    case 3: return 'Soporte';
    default: return 'Unknown';
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      // Prefer localStorage (remember me) over sessionStorage
      let storedUser = localStorage.getItem('user');
      if (!storedUser) {
        storedUser = sessionStorage.getItem('user');
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({ email: userData.Email, name: userData.Nombre, role: getRoleFromId(userData.IdRol) });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (loginData: any, rememberMe: boolean) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Email: loginData.email,
          Password: loginData.password,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Error de autenticación');
      }
      
      const userData = result.usuario;

      // Clear previous storage to avoid conflicts
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
      
      setUser({ email: userData.Email, name: userData.Nombre, role: getRoleFromId(userData.IdRol) });
      setIsAuthenticated(true);
      router.replace('/dashboard');

    } catch (error: any) {
      // The component calling login should handle toast notifications
      console.error("Login failed:", error.message);
      throw error; // Re-throw error to be caught by the calling component
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.replace('/login');
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
