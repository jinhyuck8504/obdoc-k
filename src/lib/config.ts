// 환경 변수 설정 및 검증
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    challengesEnabled: process.env.CHALLENGES_ENABLED === 'true',
    aiAnalysisEnabled: process.env.AI_ANALYSIS_ENABLED === 'true'
  }
}

// 환경 변수 검증 함수
export function validateConfig() {
  const errors: string[] = []
  
  // 필수 Supabase 환경 변수 검증
  const requiredSupabaseVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  requiredSupabaseVars.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      errors.push(`${varName}이 설정되지 않았습니다.`)
    } else if (value.includes('your-') || value.includes('dummy')) {
      errors.push(`${varName}이 더미 값으로 설정되어 있습니다. 실제 값으로 교체해주세요.`)
    }
  })
  
  // Supabase URL 형식 검증
  if (config.supabase.url) {
    try {
      const url = new URL(config.supabase.url)
      if (!url.hostname.includes('supabase.co')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL이 올바른 Supabase URL 형식이 아닙니다.')
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL이 유효한 URL 형식이 아닙니다.')
    }
  }
  
  // 에러가 있으면 콘솔에 출력하고 예외 발생
  if (errors.length > 0) {
    console.error('🚨 환경 변수 설정 오류:')
    errors.forEach(error => console.error(`  - ${error}`))
    console.error('\n📝 해결 방법:')
    console.error('  1. Supabase 프로젝트를 생성하세요.')
    console.error('  2. .env 파일의 환경 변수를 실제 값으로 교체하세요.')
    console.error('  3. 애플리케이션을 다시 시작하세요.')
    
    if (config.app.nodeEnv === 'production') {
      throw new Error('프로덕션 환경에서 환경 변수가 올바르게 설정되지 않았습니다.')
    } else {
      console.warn('⚠️  개발 환경에서 환경 변수 오류가 감지되었습니다. 더미 모드로 실행됩니다.')
    }
  } else {
    console.log('✅ 환경 변수 검증 완료')
  }
  
  return errors.length === 0
}

// 환경 변수 상태 확인 함수
export function getConfigStatus() {
  const isValidConfig = validateConfig()
  
  return {
    isValid: isValidConfig,
    isDevelopment: config.app.nodeEnv === 'development',
    isProduction: config.app.nodeEnv === 'production',
    hasSupabase: !!(config.supabase.url && config.supabase.anonKey),
    hasEmail: !!(config.email.host && config.email.user),
    supabaseUrl: config.supabase.url,
    environment: config.app.nodeEnv
  }
}

// 개발 모드 여부 확인
export function isDevelopmentMode(): boolean {
  return config.app.nodeEnv === 'development'
}

// 프로덕션 모드 여부 확인
export function isProductionMode(): boolean {
  return config.app.nodeEnv === 'production'
}

// Supabase 설정 유효성 확인
export function hasValidSupabaseConfig(): boolean {
  return !!(
    config.supabase.url && 
    config.supabase.anonKey &&
    !config.supabase.url.includes('your-') &&
    !config.supabase.anonKey.includes('your-')
  )
}
