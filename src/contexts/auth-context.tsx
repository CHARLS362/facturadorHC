
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
  // Hardcode user to be authenticated for development
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>({ email: 'test@example.com', name: 'Usuario de Prueba' });
  const [isLoading, setIsLoading] = useState(false); // Set to false as we are not loading from storage
  const router = useRouter();
  const pathname = usePathname();

  // This effect will now ensure that if the user somehow lands on /login, they are sent to /dashboard
  useEffect(() => {
    if (pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [pathname, router]);

  // Login is no longer needed for auth, but we keep it to satisfy the type.
  const login = useCallback(() => {
    router.replace('/dashboard');
  }, [router]);

  // Logout does nothing, to prevent signing out during development.
  const logout = useCallback(() => {
    console.log("Logout disabled in test mode.");
  }, []);

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
