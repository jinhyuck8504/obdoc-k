import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

// 전역 싱글톤 저장소 (브라우저 전용)
declare global {
  var __supabase_client__: any
  var __supabase_admin_client__: any
}

// 클라이언트 생성 함수
const getSupabaseClient = () => {
  // 프로덕션 환경 변수 검증 (브라우저에서만)
  validateProductionEnvironment()

  // 서버 사이드에서는 항상 새 클라이언트 생성
  if (typeof window === 'undefined') {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      return createDummySupabaseClient()
    }
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false
      }
    })
  }

  // 브라우저에서는 전역 싱글톤 사용 (중복 생성 방지)
  if (!globalThis.__supabase_client__) {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      console.warn('⚠️ 개발 모드로 실행: Supabase 환경 변수가 설정되지 않았습니다.')
      globalThis.__supabase_client__ = createDummySupabaseClient()
    } else {
      console.log('✅ 실제 Supabase 클라이언트 초기화')
      globalThis.__supabase_client__ = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'obdoc-auth-token' // 고유한 스토리지 키 사용
        }
      })
    }
  }

  return globalThis.__supabase_client__
}

const getSupabaseAdminClient = () => {
  // 서버 사이드에서는 항상 새 클라이언트 생성
  if (typeof window === 'undefined') {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      return createDummySupabaseClient()
    }
    return createClient(
      supabaseUrl!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!,
      {
        auth: {
          persistSession: false
        }
      }
    )
  }

  // 브라우저에서는 전역 싱글톤 사용
  if (!globalThis.__supabase_admin_client__) {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      globalThis.__supabase_admin_client__ = createDummySupabaseClient()
    } else {
      globalThis.__supabase_admin_client__ = createClient(
        supabaseUrl!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!
      )
    }
  }

  return globalThis.__supabase_admin_client__
}

export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()
