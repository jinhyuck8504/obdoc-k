'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRole = () => {
      try {
        const userRole = localStorage.getItem('user_role');
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Role check failed:', error);
        router.push('/unauthorized');
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-2">권한 확인 중...</span>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
