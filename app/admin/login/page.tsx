'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { clearAllAdminSessions } from '@/lib/sessionCleaner';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to admin
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to admin dashboard');
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleClearSessions = () => {
    console.log('Clearing all admin sessions manually');
    clearAllAdminSessions();
    toast.success('All sessions cleared. Please login again.');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('🔐 Login attempt for:', username);
    try {
      await login(username, password);
      console.log('✅ Login successful, setting up session...');
      toast.success('Login successful!');
      
      // Longer delay to ensure authentication state is properly set and propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🚀 Redirecting to admin dashboard...');
      router.push('/admin'); // Use router.push for proper React navigation
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-white to-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center transition-all duration-500">
        <h2
          className="text-4xl mb-6 font-serif text-[#1a233b] tracking-tight"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Admin Login
        </h2>
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <Input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="bg-white border border-gray-200 rounded-md px-4 py-3 text-base focus:border-yellow-400 focus:ring-yellow-300 transition"
          />
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-white border border-gray-200 rounded-md px-4 py-3 text-base focus:border-yellow-400 focus:ring-yellow-300 transition"
          />
          <Button
            type="submit"
            className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold text-lg rounded-md py-3 transition-all duration-300 shadow-md uppercase tracking-wide"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSessions}
            className="text-sm text-gray-600 hover:text-gray-800 border-gray-300"
          >
            Clear All Sessions
          </Button>
        </div>
      </div>
    </div>
  );
} 