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
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

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
        } else if (email.includes('admin') || email.includes('관리자')) {
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Login error:', error)
        return { data: null, error }
      }
      
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

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      // 사용자 프로필 정보 가져오기
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        console.error('Profile fetch error:', error)
        return null
      }

      return {
        id: profile.id,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        isActive: profile.is_active,
        name: profile.name
      }
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