import { supabase } from './supabase'

export interface User {
  id: string
  email?: string
  phone?: string
  role: 'doctor' | 'customer' | 'admin'
  isActive: boolean
  name?: string
  profile?: {
    phone?: string
    specialization?: string // 의사용
    licenseNumber?: string // 의사용
    birthDate?: string // 고객용
    height?: number // 고객용
  }
}

// 개발 환경 체크
const isDevelopment = process.env.NODE_ENV === 'development'
const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-url') ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

// 디버깅용 로그
console.log('🔍 Environment Debug:', {
  isDevelopment,
  isDummySupabase,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
})

// 개발 환경에서 더미 사용자 생성
const createDummyUser = (email: string, role: 'doctor' | 'customer' | 'admin' = 'customer'): User => {
  // 역할에 따른 기본 이름 설정
  let defaultName = email.split('@')[0]
  if (role === 'doctor') {
    defaultName = '김의사'
  } else if (role === 'customer') {
    defaultName = '이고객'
  } else if (role === 'admin') {
    defaultName = '관리자'
  }

  const baseUser = {
    id: `dummy-${Date.now()}`,
    email,
    name: defaultName,
    role,
    isActive: true
  }

  // 역할별 프로필 정보 추가
  switch (role) {
    case 'doctor':
      return {
        ...baseUser,
        profile: {
          specialization: '내과',
          licenseNumber: 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          phone: '010-1234-5678'
        }
      }
    case 'customer':
      return {
        ...baseUser,
        profile: {
          birthDate: '1990-01-01',
          height: 170,
          phone: '010-9876-5432'
        }
      }
    case 'admin':
      return {
        ...baseUser,
        profile: {
          phone: '010-0000-0000'
        }
      }
    default:
      return baseUser
  }
}

// 슈퍼 관리자 검증 함수
const isSuperAdmin = (email?: string): boolean => {
  if (!email) return false

  console.log('🔍 isSuperAdmin Debug:', {
    email,
    isDevelopment,
    isDummySupabase,
    condition: isDevelopment || isDummySupabase
  })

  // 개발 환경이거나 더미 Supabase를 사용하는 경우 특정 이메일을 관리자로 인정
  if (isDevelopment || isDummySupabase) {
    const result = email === 'jinhyucks@gmail.com'
    console.log('🔍 Dev/Dummy mode result:', result)
    return result
  }

  // 프로덕션 환경에서는 환경 변수 체크
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
  const superAdminSecret = process.env.NEXT_PUBLIC_SUPER_ADMIN_SECRET

  console.log('🔍 Production mode check:', {
    superAdminEmail,
    hasSecret: !!superAdminSecret
  })

  // 슈퍼 관리자 이메일과 정확히 일치하고, 시크릿 키가 설정되어 있어야 함
  return email === superAdminEmail && superAdminSecret === 'obdoc-super-admin-2024'
}

export const auth = {
  async signIn(email: string, password: string) {
    try {
      // 개발 환경에서 더미 인증 처리
      if (isDevelopment && isDummySupabase) {
        console.log('개발 모드: 더미 인증 사용', { email, password })

        // 간단한 더미 인증 로직
        if (password.length < 6) {
          return {
            data: null,
            error: { message: '비밀번호는 최소 6자 이상이어야 합니다.' }
          }
        }

        // 이메일에 따른 역할 결정
        let role: 'doctor' | 'customer' | 'admin' = 'customer'
        if (email.includes('doctor') || email.includes('의사')) {
          role = 'doctor'
        } else if (email.includes('admin') || email.includes('관리자') || isSuperAdmin(email)) {
          role = 'admin'
        } else if (email.includes('customer')) {
          role = 'customer'
        }

        const dummyUser = createDummyUser(email, role)

        // 더미 세션 데이터
        const dummySession = {
          access_token: 'dummy-access-token',
          refresh_token: 'dummy-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: dummyUser.id,
            email: dummyUser.email,
            role: dummyUser.role
          }
        }

        // 토큰 만료 시간 설정 (24시간)
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
        localStorage.setItem('token_expiry', expiryTime.toISOString())
        localStorage.setItem('dummy_user', JSON.stringify(dummyUser))

        return {
          data: { session: dummySession, user: dummySession.user },
          error: null
        }
      }

      // 실제 Supabase 인증
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        return { data: null, error }
      }

      // 슈퍼 관리자 검증 (임시 비활성화 - 개발용)
      // TODO: 프로덕션에서 다시 활성화 필요
      console.log('🔧 슈퍼 관리자 검증 임시 비활성화됨')
      /*
      if (!isDummySupabase && data.user?.email && !isSuperAdmin(data.user.email)) {
        // 슈퍼 관리자가 아닌 경우 admin 역할 접근 차단
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userProfile?.role === 'admin') {
          console.warn('🚨 무권한 관리자 접근 시도:', data.user.email)
          await supabase.auth.signOut()
          return {
            data: null,
            error: { message: '접근 권한이 없습니다.' }
          }
        }
      }
      */

      return { data, error: null }
    } catch (error) {
      console.error('Login exception:', error)
      return { data: null, error: { message: '로그인 중 오류가 발생했습니다.' } }
    }
  },

  async signOut() {
    try {
      // 개발 환경에서 더미 로그아웃 처리
      if (isDevelopment && isDummySupabase) {
        console.log('개발 모드: 더미 로그아웃')
        localStorage.removeItem('dummy_user')
        localStorage.removeItem('token_expiry')
        return { error: null }
      }

      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Logout error:', error)
      return { error: { message: '로그아웃 중 오류가 발생했습니다.' } }
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // 개발 환경에서 더미 사용자 반환
      if (isDevelopment && isDummySupabase) {
        const dummyUser = localStorage.getItem('dummy_user')
        if (dummyUser) {
          return JSON.parse(dummyUser)
        }
        return null
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('Auth user error:', authError)
        return null
      }

      if (!user) return null

      // 사용자 프로필 정보 가져오기 (재시도 로직 추가)
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              // 사용자가 users 테이블에 없는 경우
              console.warn('User not found in users table:', user.id)
              return null
            }
            throw error
          }

          if (profile) {
            // 🔒 보안 검증: 인증된 이메일과 프로필 이메일이 일치하는지 확인
            if (user.email !== profile.email) {
              console.warn('🚨 이메일 불일치 감지:', {
                authEmail: user.email,
                profileEmail: profile.email,
                userId: user.id
              })

              // 관리자 역할인 경우 특히 엄격하게 검증
              if (profile.role === 'admin') {
                console.error('🚨 관리자 계정 이메일 불일치 - 접근 차단')
                await supabase.auth.signOut()
                return null
              }

              // 일반 사용자도 이메일 불일치 시 접근 차단
              console.error('🚨 사용자 계정 이메일 불일치 - 접근 차단')
              await supabase.auth.signOut()
              return null
            }

            return {
              id: profile.id,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              isActive: profile.is_active
            }
          }
        } catch (error) {
          console.error(`Profile fetch attempt ${retryCount + 1} failed:`, error)
          retryCount++

          if (retryCount < maxRetries) {
            // 재시도 전 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      console.error('Failed to fetch profile after all retries')
      return null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async resetPassword(email: string) {
    try {
      // 개발 환경에서 더미 비밀번호 재설정
      if (isDevelopment && isDummySupabase) {
        console.log('개발 모드: 더미 비밀번호 재설정', email)
        return { error: null }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: { message: '비밀번호 재설정 중 오류가 발생했습니다.' } }
    }
  },

  async signUp(email: string, password: string, userData: any) {
    try {
      // 개발 환경에서 더미 회원가입
      if (isDevelopment && isDummySupabase) {
        console.log('개발 모드: 더미 회원가입', { email, userData })

        if (password.length < 6) {
          return {
            data: null,
            error: { message: '비밀번호는 최소 6자 이상이어야 합니다.' }
          }
        }

        const dummyUser = createDummyUser(email, userData.role || 'customer')
        localStorage.setItem('dummy_user', JSON.stringify(dummyUser))

        return {
          data: { user: dummyUser },
          error: null
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      return { data, error }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error: { message: '회원가입 중 오류가 발생했습니다.' } }
    }
  }
}
