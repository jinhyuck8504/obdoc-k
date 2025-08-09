'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'doctor' | 'customer';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 간단한 인증 체크 로직
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userRole = localStorage.getItem('user_role');
        
        if (!token) {
          router.push('/login');
          return;
        }

        if (requiredRole && userRole !== requiredRole) {
          router.push('/unauthorized');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-2">로딩 중...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
