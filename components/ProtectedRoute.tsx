'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else if (requireAdmin && user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, requireAdmin, router]);

  if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
} 