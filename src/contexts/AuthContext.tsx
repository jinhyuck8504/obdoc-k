'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { auth, User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const redirectedRef = useRef(false) // 리다이렉트 중복 방지
  const initializingRef = useRef(false) // 초기화 중복 방지

  // 자동 로그아웃 타이머 (30분)
  const AUTO_LOGOUT_TIME = 30 * 60 * 1000 // 30분

  // 개발 환경 체크 (auth.ts와 동일한 로직)
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-url') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

  console.log('🔍 AuthContext Debug:', {
    isDevelopment,
    isDummySupabase,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
  })

  const refreshUser = async () => {
    try {
      setLoading(true)
      const currentUser = await auth.getCurrentUser()
      console.log('🔄 AuthContext: refreshUser result:', currentUser)
      setUser(currentUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      redirectedRef.current = false // 리다이렉트 플래그 초기화
      
      console.log('🔐 AuthContext: signIn 시작', { email })
      const { data, error } = await auth.signIn(email, password)

      if (error) {
        console.error('🚨 AuthContext: signIn 오류', error)
        return { error }
      }

      console.log('✅ AuthContext: signIn 성공', data)

      // 사용자 정보 새로고침
      await refreshUser()

      // 세션 정보 로컬 스토리지에 저장
      if (data?.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))
      }

      return { error: null }
    } catch (error) {
      console.error('🚨 AuthContext: signIn 예외', error)
      return { error: { message: '로그인 중 오류가 발생했습니다.' } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      redirectedRef.current = false
      console.log('🚪 AuthContext: signOut 시작')
      
      await auth.signOut()
      setUser(null)

      // 로컬 스토리지 정리
      localStorage.removeItem('lastActivity')
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('token_expiry')
      localStorage.removeItem('dummy_user')

      // 모든 Supabase 관련 로컬 스토리지 정리
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key)
        }
      })

      console.log('✅ AuthContext: signOut 완료')
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('사용자가 로그인되어 있지 않습니다')

    try {
      setLoading(true)
      // 로컬 상태 업데이트 (개발 환경)
      setUser(prev => prev ? { ...prev, ...updates } : null)

      // 실제 환경에서는 Supabase 프로필 업데이트
      // const { error } = await supabase
      //   .from('profiles')
      //   .update(updates)
      //   .eq('id', user.id)
      // if (error) throw error

    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 활동 시간 업데이트
  const updateLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString())
  }

  // 자동 로그아웃 체크
  const checkAutoLogout = () => {
    if (!user) return

    const lastActivity = localStorage.getItem('lastActivity')
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
      if (timeSinceLastActivity > AUTO_LOGOUT_TIME) {
        console.log('Auto logout due to inactivity')
        signOut()
      }
    }
  }

  useEffect(() => {
    let mounted = true

    // 초기 사용자 상태 확인
    const initializeAuth = async () => {
      if (initializingRef.current) {
        console.log('🔄 AuthContext: 이미 초기화 중, 건너뜀')
        return
      }
      
      initializingRef.current = true
      console.log('🚀 AuthContext: 인증 초기화 시작')

      try {
        // 개발 환경에서 더미 사용자 복원
        if (isDevelopment && isDummySupabase) {
          console.log('🔧 AuthContext: 개발 모드 - 더미 사용자 복원 시도')
          const dummyUser = localStorage.getItem('dummy_user')
          if (dummyUser && mounted) {
            const parsedUser = JSON.parse(dummyUser)
            console.log('✅ AuthContext: 더미 사용자 복원됨', parsedUser)
            setUser(parsedUser)
          } else if (mounted) {
            console.log('❌ AuthContext: 더미 사용자 없음')
            setUser(null)
          }
          if (mounted) {
            setLoading(false)
          }
          return
        }

        // 실제 Supabase 세션 복원 시도
        console.log('🔧 AuthContext: 실제 Supabase 세션 복원 시도')
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user && mounted) {
          console.log('✅ AuthContext: Supabase 세션 발견, 사용자 정보 가져오기')
          const currentUser = await auth.getCurrentUser()
          console.log('✅ AuthContext: 사용자 정보 가져옴', currentUser)
          setUser(currentUser)
        } else if (mounted) {
          console.log('❌ AuthContext: Supabase 세션 없음')
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          initializingRef.current = false
        }
      }
    }

    initializeAuth()

    // 인증 상태 변경 감지 (실제 Supabase에서만)
    let subscription: any = null
    if (!isDummySupabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('Auth state changed:', event, session?.user?.id)

          if (!mounted) return

          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const currentUser = await auth.getCurrentUser()
              setUser(currentUser)
            } catch (error) {
              console.error('Error getting user after sign in:', error)
              setUser(null)
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            try {
              const currentUser = await auth.getCurrentUser()
              setUser(currentUser)
            } catch (error) {
              console.error('Error getting user after token refresh:', error)
            }
          }

          if (mounted) {
            setLoading(false)
          }
        }
      )
      subscription = data.subscription
    }

    return () => {
      mounted = false
      initializingRef.current = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // 자동 로그아웃 및 활동 감지
  useEffect(() => {
    if (!user) return

    // 초기 활동 시간 설정
    updateLastActivity()

    // 사용자 활동 감지 이벤트
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    const handleActivity = () => {
      updateLastActivity()
    }

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // 주기적으로 자동 로그아웃 체크 (1분마다)
    const interval = setInterval(checkAutoLogout, 60000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      clearInterval(interval)
    }
  }, [user])

  // 자동 리다이렉트 로직 (무한 루프 방지 강화)
  useEffect(() => {
    if (!loading && user && !redirectedRef.current) {
      const currentPath = window.location.pathname
      console.log('🔄 AuthContext: 리다이렉트 체크', { currentPath, userRole: user.role })

      // 로그인/회원가입 페이지에 있으면 대시보드로 리다이렉트
      if (currentPath === '/login' || currentPath === '/signup') {
        console.log('🔄 AuthContext: 로그인/회원가입 페이지에서 대시보드로 리다이렉트')
        redirectToDashboard(user.role)
        redirectedRef.current = true
      }
      // 루트 경로에서도 대시보드로 리다이렉트 (로그인된 사용자의 경우)
      else if (currentPath === '/') {
        console.log('🔄 AuthContext: 루트 경로에서 대시보드로 리다이렉트')
        redirectToDashboard(user.role)
        redirectedRef.current = true
      }
    }
  }, [user, loading, router])

  const redirectToDashboard = (role: string) => {
    console.log('🔄 AuthContext: redirectToDashboard 호출', { role, alreadyRedirected: redirectedRef.current })

    // 이미 리다이렉트 중이면 중단
    if (redirectedRef.current) {
      console.log('🚫 AuthContext: 이미 리다이렉트 중, 중단')
      return
    }

    redirectedRef.current = true

    // 타임아웃으로 무한 루프 방지
    setTimeout(() => {
      switch (role) {
        case 'doctor':
          console.log('🔄 AuthContext: 의사 대시보드로 이동')
          router.push('/dashboard/doctor')
          break
        case 'customer':
          console.log('🔄 AuthContext: 고객 대시보드로 이동')
          router.push('/dashboard/customer')
          break
        case 'patient':
          console.log('🔄 AuthContext: 환자 대시보드로 이동 (고객으로 처리)')
          router.push('/dashboard/customer')
          break
        case 'admin':
          console.log('🔄 AuthContext: 관리자 대시보드로 이동')
          router.push('/dashboard/admin')
          break
        default:
          console.warn('Unknown role:', role)
          router.push('/login')
      }
    }, 100)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
    updateProfile
  }

  console.log('🔍 AuthContext: 현재 상태', {
    user: user ? { id: user.id, role: user.role } : null,
    loading,
    redirected: redirectedRef.current
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
