import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 유효한 환경 변수인지 확인하는 함수
const isValidSupabaseConfig = (url?: string, key?: string): boolean => {
  if (!url || !key) return false
  if (url.includes('your_supabase_url_here') || key.includes('your_supabase_anon_key_here')) return false
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
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
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

// 브라우저 전용 싱글톤 저장소
let browserSupabaseClient: any = null
let browserSupabaseAdminClient: any = null

// 클라이언트 생성 함수
const getSupabaseClient = () => {
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

  // 브라우저에서는 싱글톤 사용
  if (!browserSupabaseClient) {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      console.warn('Supabase 환경 변수가 올바르게 설정되지 않았습니다. 더미 클라이언트를 사용합니다.')
      browserSupabaseClient = createDummySupabaseClient()
    } else {
      browserSupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
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

  // 브라우저에서는 싱글톤 사용
  if (!browserSupabaseAdminClient) {
    if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
      browserSupabaseAdminClient = createDummySupabaseClient()
    } else {
      browserSupabaseAdminClient = createClient(
        supabaseUrl!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!
      )
    }
  }
  
  return browserSupabaseAdminClient
}

export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()
