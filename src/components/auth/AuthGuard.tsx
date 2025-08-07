'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { HydrationBoundary } from '@/components/hydration'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'doctor' | 'customer' | 'admin'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  
  // 개발 환경 체크 (auth.ts와 동일한 로직)
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-url') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')
  
  console.log('🔍 AuthGuard Debug:', {
    isDevelopment,
    isDummySupabase,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    user: user ? { id: user.id, role: user.role } : null,
    loading,
    requiredRole
  })
  
  useEffect(() => {
    // 개발 환경이고 더미 Supabase를 사용하는 경우 인증 우회
    if (isDevelopment && isDummySupabase) {
      console.log('🔧 AuthGuard: 개발 모드에서 인증 우회')
      return // 인증 체크를 건너뜀
    }
    
    if (!loading) {
      if (!user) {
        console.log('🚨 AuthGuard: 사용자 없음, 로그인 페이지로 리다이렉트')
        setRedirecting(true)
        router.push('/login')
        return
      }
      
      if (requiredRole && user.role !== requiredRole) {
        console.log('🚨 AuthGuard: 권한 부족, 권한 없음 페이지로 리다이렉트')
        setRedirecting(true)
        router.push('/unauthorized')
        return
      }
      
      console.log('✅ AuthGuard: 인증 성공')
    }
  }, [user, loading, requiredRole, router, isDevelopment, isDummySupabase])
  
  // 개발 환경에서 더미 Supabase 사용 시 인증 우회
  if (isDevelopment && isDummySupabase) {
    console.log('🔧 AuthGuard: 개발 모드 렌더링')
    return (
      <HydrationBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
            <LoadingSpinner size="lg" text="페이지 로딩 중..." />
          </div>
        }
      >
        <div className="min-h-screen bg-yellow-50 border-t-4 border-yellow-400">
          <div className="bg-yellow-100 border-b border-yellow-200 p-3">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 font-medium">
                개발 모드: 인증이 우회되었습니다 (더미 Supabase 사용 중)
              </p>
            </div>
          </div>
          {children}
        </div>
      </HydrationBoundary>
    )
  }

  if (loading) {
    console.log('🔄 AuthGuard: 로딩 중')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4">
            <Shield className="h-12 w-12 text-slate-600 mx-auto animate-pulse" />
          </div>
          <LoadingSpinner size="lg" text="인증 확인 중..." />
        </div>
      </div>
    )
  }

  if (!user || redirecting) {
    console.log('🚨 AuthGuard: 사용자 없음 또는 리다이렉트 중')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4">
            <Shield className="h-12 w-12 text-slate-600 mx-auto animate-pulse" />
          </div>
          <LoadingSpinner size="lg" text="로그인 페이지로 이동 중..." />
        </div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('🚨 AuthGuard: 권한 부족')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-6">
            이 페이지에 접근하려면 {requiredRole === 'doctor' ? '의사' : requiredRole === 'admin' ? '관리자' : '고객'} 권한이 필요합니다.
          </p>
          <LoadingSpinner size="md" text="권한 확인 페이지로 이동 중..." />
        </div>
      </div>
    )
  }

  console.log('✅ AuthGuard: 정상 렌더링')
  return (
    <HydrationBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
          <LoadingSpinner size="lg" text="페이지 로딩 중..." />
        </div>
      }
    >
      {children}
    </HydrationBoundary>
  )
}
