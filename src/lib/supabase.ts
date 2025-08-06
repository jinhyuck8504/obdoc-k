import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 싱글톤 인스턴스 저장소 (모듈 레벨)
let supabaseInstance: any = null
let supabaseAdminInstance: any = null

// 프로덕션 환경 변수 검증
const validateProductionEnvironment = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const missingVars: string[] = []

    if (!supabaseUrl || supabaseUrl.includes('your_supabase_url_here') || supabaseUrl.startsWith('missing_')) {
      missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    }

    if (!supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here') || supabaseAnonKey.startsWith('missing_')) {
      missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    if (missingVars.length > 0) {
      console.error('🚨 환경 변수 설정 오류:')
      missingVars.forEach(varName => {
        console.error(`  - ${varName}이 설정되지 않았습니다.`)
      })
      console.error(' 📝 해결 방법:')
      console.error('  1. Supabase 프로젝트를 생성하세요.')
      console.error('  2. Netlify 환경 변수에 실제 값을 설정하세요.')
      console.error('  3. 애플리케이션을 다시 배포하세요.')

      throw new Error('프로덕션 환경에서 환경 변수가 올바르게 설정되지 않았습니다.')
    }
  }
}

// 슈퍼 관리자 검증 함수
const isSuperAdmin = (email?: string): boolean => {
  if (!email) return false
  
  // 환경 변수에서 슈퍼 관리자 이메일 확인
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
  const superAdminSecret = process.env.NEXT_PUBLIC_SUPER_ADMIN_SECRET
  
  // 슈퍼 관리자 이메일과 정확히 일치하고, 시크릿 키가 설정되어 있어야 함
  return email === superAdminEmail && superAdminSecret === 'obdoc-super-admin-2024'
}

// 유효한 환경 변수인지 확인하는 함수
const isValidSupabaseConfig = (url?: string, key?: string): boolean => {
  if (!url || !key) return false
  if (url.includes('your_supabase_url_here') || key.includes('your_supabase_anon_key_here')) return false
  if (url.startsWith('missing_') || key.startsWith('missing_')) return false
  try {
    new URL(url) // URL 유효성 검사
    return true
  } catch {
    return false
  }
}

// 더미 클라이언트 (환경 변수가 없을 때)
const createDummySupabaseClient = () => {
  console.log('🚀 개발 모드: 더미 Supabase 클라이언트 사용')

  return {
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase가 설정되지 않았습니다.' } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase가 설정되지 않았습니다.' } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null })
        }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({
          eq: () => ({ data: null, error: null })
        }),
        order: () => ({ data: [], error: null })
      }),
      insert: async () => ({ data: null, error: null }),
      update: () => ({
        eq: () => ({ data: null, error: null })
      })
    })
  }
}

// 클라이언트 생성 함수 (강화된 싱글톤 패턴)
const getSupabaseClient = () => {
  // 이미 인스턴스가 있으면 재사용
  if (supabaseInstance) {
    return supabaseInstance
  }

  // 프로덕션 환경 변수 검증 (브라우저에서만)
  validateProductionEnvironment()

  // 서버 사이드에서는 세션 비활성화
  if (typeof window === 'undefined') {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      supabaseInstance = createDummySupabaseClient()
    } else {
      supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: false
        }
      })
    }
    return supabaseInstance
  }

  // 브라우저에서 실제 클라이언트 생성
  if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
    console.warn('⚠️ 개발 모드로 실행: Supabase 환경 변수가 설정되지 않았습니다.')
    supabaseInstance = createDummySupabaseClient()
  } else {
    console.log('✅ 실제 Supabase 클라이언트 초기화 (싱글톤)')
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'obdoc-auth-token-v2', // 고유한 스토리지 키 사용
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  }

  return supabaseInstance
}

const getSupabaseAdminClient = () => {
  // 이미 인스턴스가 있으면 재사용
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  // 서버 사이드에서는 세션 비활성화
  if (typeof window === 'undefined') {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      supabaseAdminInstance = createDummySupabaseClient()
    } else {
      supabaseAdminInstance = createClient(
        supabaseUrl!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!,
        {
          auth: {
            persistSession: false
          }
        }
      )
    }
    return supabaseAdminInstance
  }

  // 브라우저에서 관리자 클라이언트 생성
  if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
    supabaseAdminInstance = createDummySupabaseClient()
  } else {
    supabaseAdminInstance = createClient(
      supabaseUrl!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!,
      {
        auth: {
          persistSession: false,
          storageKey: 'obdoc-admin-auth-token-v2'
        }
      }
    )
  }

  return supabaseAdminInstance
}

export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()
