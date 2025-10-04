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
    console.log('🔥 useAuth: STARTING authentication check...');
    
    try {
      // Check if there's an active session from recent login
      const sessionTime = sessionStorage.getItem('adminLoginTime');
      const currentTime = Date.now();
      
      if (sessionTime) {
        const timeDiff = currentTime - parseInt(sessionTime);
        const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        
        if (timeDiff < twoHours) {
          console.log('🔍 Found recent session, checking if still valid...');
          
          // Try to restore user data from sessionStorage
          const userData = sessionStorage.getItem('adminUser');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user && user.username && user.id) {
                console.log('🔄 Restoring authenticated user from session:', user.username);
                
                // Set state immediately - no setTimeout needed
                setUser(user);
                setIsAuthenticated(true);
                setLoading(false);
                console.log('✅ Auth state restored IMMEDIATELY - user:', user.username, 'authenticated:', true);
                return;
              } else {
                console.log('⚠️ Invalid user data structure in session');
              }
            } catch (error) {
              console.error('⚠️ Failed to parse user data from session:', error);
            }
          }
          
          console.log('⚠️ Session time found but no valid user data - treating as expired');
        } else {
          console.log('⏰ Session expired (>2 hours), clearing...');
        }
      } else {
        console.log('🔍 No session time found');
      }
      
      // Only clear sessions if no valid session exists
      console.log('🧹 No valid session found - clearing all sessions');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminSessionTimestamp');
      sessionStorage.removeItem('adminLoginTime');
      sessionStorage.removeItem('adminUser');
      
      // Set to not authenticated
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('💥 Error during auth check:', error);
      // Fallback: clear everything and set not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('✅ Auth check COMPLETE');
    }
  }, []);
  
  // Auto-logout timer for 2-hour timeout while admin is active
  useEffect(() => {
    let autoLogoutTimer: NodeJS.Timeout;
    
    if (isAuthenticated && user) {
      console.log('⏰ Starting 2-hour auto-logout timer for:', user.username);
      
      // Set 2-hour auto-logout timer
      autoLogoutTimer = setTimeout(() => {
        console.log('🚨 AUTO-LOGOUT: 2 hours expired - logging out admin');
        logout();
        window.location.href = '/admin/login';
      }, 2 * 60 * 60 * 1000); // 2 hours
    }
    
    return () => {
      if (autoLogoutTimer) {
        console.log('🔄 Clearing auto-logout timer');
        clearTimeout(autoLogoutTimer);
      }
    };
  }, [isAuthenticated, user]);

  const login = async (username: string, password: string) => {
    // Prevent multiple simultaneous login attempts
    if (loading) {
      console.log('useAuth: Login already in progress, ignoring duplicate request');
      return;
    }
    
    setLoading(true);
    try {
      console.log('useAuth: Starting login process for:', username);
      const result = await AdminAuthService.login(username, password);
      console.log('useAuth: Login result:', result);
      
      if (!result.success) {
        const errorMessage = result.error || 'Login failed';
        console.error('useAuth: Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (result.user) {
        const authUser: User = {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          full_name: result.user.full_name,
          role: 'admin'
        };
        
        console.log('useAuth: Setting authenticated user:', authUser);
        
        // Store session data first
        try {
          sessionStorage.setItem('adminLoginTime', Date.now().toString());
          sessionStorage.setItem('adminUser', JSON.stringify(authUser));
          console.log('✅ Session data stored successfully');
        } catch (storageError) {
          console.warn('useAuth: Failed to store session data:', storageError);
        }
        
        // Set authentication state immediately for faster UI response
        setUser(authUser);
        setIsAuthenticated(true);
        
        console.log('✅ Login successful - session active with user data stored');
      } else {
        throw new Error('No user data received from login');
      }
    } catch (error) {
      console.error('useAuth: Login error:', error);
      throw error; // Re-throw to be handled by the login component
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
    console.log('📝 useAuth: Logging out admin user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all storage (localStorage and sessionStorage)
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Logout complete - all sessions cleared');
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