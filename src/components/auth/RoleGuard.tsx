'use client'
import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isRouteAllowed, getRedirectPath, UserRole } from '@/lib/roleUtils'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallbackPath?: string
}

// 슈퍼 관리자 검증 함수 (정식 서비스용)
const isSuperAdmin = (email?: string): boolean => {
  if (!email) return false
  
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
  const superAdminSecret = process.env.NEXT_PUBLIC_SUPER_ADMIN_SECRET
  
  console.log('🔍 슈퍼 관리자 검증:', { 
    email, 
    superAdminEmail, 
    hasSecret: !!superAdminSecret,
    isMatch: email === superAdminEmail,
    secretMatch: superAdminSecret === 'obdoc-super-admin-2024'
  })
  
  return email === superAdminEmail && superAdminSecret === 'obdoc-super-admin-2024'
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackPath = '/unauthorized' 
}: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  console.log('🔍 RoleGuard Debug:', {
    pathname,
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    loading,
    allowedRoles
  })

  useEffect(() => {
    if (loading) return

    // 사용자가 로그인하지 않은 경우
    if (!user) {
      console.log('🚨 RoleGuard: 사용자 없음, 로그인 페이지로 리다이렉트')
      router.push('/login')
      return
    }

    const userRole = user.role as UserRole

    // 관리자 페이지 접근 시 슈퍼 관리자 검증
    if (pathname.includes('/dashboard/admin') && userRole === 'admin') {
      const isSuper = isSuperAdmin(user.email)
      console.log('🔍 관리자 페이지 접근 검증:', {
        email: user.email,
        isSuper,
        pathname
      })
      
      if (!isSuper) {
        console.warn('🚨 무권한 관리자 페이지 접근 시도:', user.email)
        router.push('/unauthorized')
        return
      } else {
        console.log('✅ 슈퍼 관리자 권한 확인됨:', user.email)
      }
    }

    // 특정 역할만 허용하는 경우
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log('🚨 RoleGuard: 역할 권한 부족', { userRole, allowedRoles })
      router.push(fallbackPath)
      return
    }

    // 현재 경로가 사용자 역할에 허용되지 않는 경우
    if (!isRouteAllowed(pathname, userRole)) {
      console.log('🚨 RoleGuard: 경로 접근 권한 없음', { pathname, userRole })
      const redirectPath = getRedirectPath(userRole, pathname)
      if (redirectPath) {
        router.push(redirectPath)
        return
      }
    }

    console.log('✅ RoleGuard: 권한 체크 통과')
  }, [user, loading, pathname, router, allowedRoles, fallbackPath])

  // 로딩 중
  if (loading) {
    console.log('🔄 RoleGuard: 로딩 중')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // 사용자가 없거나 권한이 없는 경우
  if (!user) {
    console.log('🚨 RoleGuard: 사용자 없음')
    return null
  }

  const userRole = user.role as UserRole

  // 관리자 페이지 접근 시 슈퍼 관리자 검증 (렌더링 단계)
  if (pathname.includes('/dashboard/admin') && userRole === 'admin') {
    const isSuper = isSuperAdmin(user.email)
    if (!isSuper) {
      console.log('🚨 RoleGuard: 슈퍼 관리자 권한 없음 (렌더링 단계)')
      return null
    }
  }

  // 특정 역할 체크
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('🚨 RoleGuard: 역할 권한 부족 (렌더링 단계)')
    return null
  }

  // 경로 권한 체크
  if (!isRouteAllowed(pathname, userRole)) {
    console.log('🚨 RoleGuard: 경로 접근 권한 없음 (렌더링 단계)')
    return null
  }

  console.log('✅ RoleGuard: 정상 렌더링')
  return <>{children}</>
}
