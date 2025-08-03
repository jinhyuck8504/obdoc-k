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

export default function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackPath = '/unauthorized' 
}: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // 사용자가 로그인하지 않은 경우
    if (!user) {
      router.push('/login')
      return
    }

    const userRole = user.role as UserRole

    // 특정 역할만 허용하는 경우
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      router.push(fallbackPath)
      return
    }

    // 현재 경로가 사용자 역할에 허용되지 않는 경우
    if (!isRouteAllowed(pathname, userRole)) {
      const redirectPath = getRedirectPath(userRole, pathname)
      if (redirectPath) {
        router.push(redirectPath)
        return
      }
    }
  }, [user, loading, pathname, router, allowedRoles, fallbackPath])

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // 사용자가 없거나 권한이 없는 경우
  if (!user) {
    return null
  }

  const userRole = user.role as UserRole

  // 특정 역할 체크
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null
  }

  // 경로 권한 체크
  if (!isRouteAllowed(pathname, userRole)) {
    return null
  }

  return <>{children}</>
}