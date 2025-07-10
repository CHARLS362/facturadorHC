
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email?: string;
  name?: string;
  role?: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (loginData: any, rememberMe: boolean) => void;
  logout: () => void;
  updateUser: (newUserData: User | null) => void;
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

  const getStorage = (): Storage => {
    // Check if localStorage has 'user' which indicates "remember me" was checked.
    return localStorage.getItem('user') ? localStorage : sessionStorage;
  };

  useEffect(() => {
    try {
      const storage = getStorage();
      let storedUser = storage.getItem('user');

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({ 
            email: userData.Email, 
            name: userData.Nombre, 
            role: getRoleFromId(userData.IdRol),
            avatarUrl: userData.avatarUrl || null 
        });
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

  const updateUser = useCallback((newUserData: User | null) => {
    if (newUserData) {
        const storage = getStorage();
        // Update user state
        setUser(newUserData);
        // Update persisted storage
        const storedUser = storage.getItem('user');
        if (storedUser) {
            try {
                const parsedStoredUser = JSON.parse(storedUser);
                // Merge new data with existing data to keep things like IdRol etc.
                const updatedStoredUser = {
                    ...parsedStoredUser,
                    Nombre: newUserData.name,
                    avatarUrl: newUserData.avatarUrl,
                };
                storage.setItem('user', JSON.stringify(updatedStoredUser));
            } catch (e) {
                console.error("Could not update user in storage", e);
            }
        }
    } else {
        // Handle case where user is set to null (e.g., logout)
        setUser(null);
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

      localStorage.removeItem('user');
      sessionStorage.removeItem('user');

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(userData));
      
      setUser({ 
          email: userData.Email, 
          name: userData.Nombre, 
          role: getRoleFromId(userData.IdRol), 
          avatarUrl: userData.avatarUrl || null 
      });
      setIsAuthenticated(true);
      router.replace('/dashboard');

    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, isLoading }}>
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
