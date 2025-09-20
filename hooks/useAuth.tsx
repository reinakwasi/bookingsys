'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminAuthService } from '@/lib/adminAuth';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    console.log('useAuth: Checking stored user...');
    const storedUser = localStorage.getItem('adminUser');
    console.log('useAuth: Stored user:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('useAuth: Parsed user:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('useAuth: Set authenticated to true');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('adminUser');
      }
    } else {
      console.log('useAuth: No stored user found');
    }
    setLoading(false);
    console.log('useAuth: Loading set to false');
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const result = await AdminAuthService.login(username, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      if (result.user) {
        const authUser: User = {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          full_name: result.user.full_name,
          role: 'admin'
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem('adminUser', JSON.stringify(authUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    return await AdminAuthService.changePassword(user.id, oldPassword, newPassword);
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}