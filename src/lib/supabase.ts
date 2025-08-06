import { createClient } from '@supabase/supabase-js'
import { config, validateConfig, hasValidSupabaseConfig } from './config'

// 애플리케이션 시작 시 환경 변수 검증
validateConfig()

// 더미 클라이언트 (환경 변수가 올바르지 않을 때)
const createDummySupabaseClient = () => {
  console.log('🚀 개발 모드: 더미 Supabase 클라이언트 사용')
  console.log('📝 실제 서비스를 위해서는 Supabase 프로젝트를 생성하고 Netlify 환경 변수를 설정해주세요.')

  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // 개발용 관리자 계정 시뮬레이션
        if (email === 'admin@obdoc.co.kr' && password === 'admin123!@#') {
          const mockUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@obdoc.co.kr',
            role: 'admin',
            user_metadata: { role: 'admin' }
          }
          
          console.log('✅ 개발 모드: 관리자 로그인 성공')
          return { 
            data: { 
              user: mockUser,
              session: {
                user: mockUser,
                access_token: 'dummy-token',
                refresh_token: 'dummy-refresh-token'
              }
            }, 
            error: null 
          }
        }
        
        return { 
          data: { user: null, session: null }, 
          error: { message: '개발 모드: 관리자 계정(admin@obdoc.co.kr)만 로그인 가능합니다.' } 
        }
      },
      signOut: async () => {
        console.log('🚪 개발 모드: 로그아웃')
        return { error: null }
      },
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      resetPasswordForEmail: async () => ({ 
        data: {}, 
        error: { message: '개발 모드: 이메일 기능이 비활성화되어 있습니다.' } 
      }),
      onAuthStateChange: (callback: any) => {
        // 더미 구독 객체 반환
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => console.log('🔄 개발 모드: 인증 상태 구독 해제') 
            } 
          } 
        }
      },
      signUp: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: '개발 모드: 회원가입이 비활성화되어 있습니다.' } 
      })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          order: (column: string, options?: any) => ({ data: [], error: null }),
          limit: (count: number) => ({ data: [], error: null })
        }),
        order: (column: string, options?: any) => ({ data: [], error: null }),
        limit: (count: number) => ({ data: [], error: null })
      }),
      insert: async (data: any) => ({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({ data: null, error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({ data: null, error: null })
      })
    })
  }
}

// 브라우저 전용 싱글톤 저장소
let browserSupabaseClient: any = null
let browserSupabaseAdminClient: any = null

// 클라이언트 생성 함수
const getSupabaseClient = () => {
  // 서버 사이드에서는 항상 새 클라이언트 생성
  if (typeof window === 'undefined') {
    if (!hasValidSupabaseConfig()) {
      return createDummySupabaseClient()
    }
    return createClient(config.supabase.url!, config.supabase.anonKey!, {
      auth: {
        persistSession: false
      }
    })
  }

  // 브라우저에서는 싱글톤 사용 (GoTrueClient 중복 방지)
  if (!browserSupabaseClient) {
    if (!hasValidSupabaseConfig()) {
      console.warn('⚠️  Supabase 환경 변수가 올바르게 설정되지 않았습니다. 개발 모드로 실행됩니다.')
      browserSupabaseClient = createDummySupabaseClient()
    } else {
      console.log('✅ 실제 Supabase 클라이언트 초기화')
      browserSupabaseClient = createClient(config.supabase.url!, config.supabase.anonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    }
  }

  return browserSupabaseClient
}

const getSupabaseAdminClient = () => {
  // 서버 사이드에서는 항상 새 클라이언트 생성
  if (typeof window === 'undefined') {
    if (!hasValidSupabaseConfig()) {
      return createDummySupabaseClient()
    }
    return createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey || config.supabase.anonKey!,
      {
        auth: {
          persistSession: false
        }
      }
    )
  }

  // 브라우저에서는 싱글톤 사용
  if (!browserSupabaseAdminClient) {
    if (!hasValidSupabaseConfig()) {
      browserSupabaseAdminClient = createDummySupabaseClient()
    } else {
      browserSupabaseAdminClient = createClient(
        config.supabase.url!,
        config.supabase.serviceRoleKey || config.supabase.anonKey!
      )
    }
  }

  return browserSupabaseAdminClient
}

export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()

// 설정 상태 확인 함수 내보내기
export { hasValidSupabaseConfig, config }
