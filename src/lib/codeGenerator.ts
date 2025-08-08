import { supabase } from './supabase'

/**
 * 8자리 병원 가입 코드 생성 (ABC12345 형식)
 * 첫 3자리: 영문 대문자
 * 나머지 5자리: 숫자
 */
export function generateHospitalCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  
  let code = ''
  
  // 첫 3자리는 영문 대문자
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  
  // 나머지 5자리는 숫자
  for (let i = 0; i < 5; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  return code
}

/**
 * 코드 형식 검증
 * @param code 검증할 코드
 * @returns 유효한 형식인지 여부
 */
export function validateCodeFormat(code: string): boolean {
  const codePattern = /^[A-Z]{3}[0-9]{5}$/
  return codePattern.test(code)
}

/**
 * 중복되지 않는 고유한 코드 생성
 * @param maxAttempts 최대 시도 횟수 (기본값: 10)
 * @returns 고유한 코드 또는 null (실패 시)
 */
export async function generateUniqueCode(maxAttempts: number = 10): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateHospitalCode()
    
    // 중복 체크
    const { data, error } = await supabase
      .from('hospital_codes')
      .select('id')
      .eq('code', code)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // 데이터가 없음 (중복되지 않음)
      return code
    }
    
    if (error) {
      console.error('Code uniqueness check error:', error)
      continue
    }
    
    // 중복된 코드가 있으면 다시 시도
    if (data) {
      continue
    }
    
    return code
  }
  
  // 최대 시도 횟수 초과
  return null
}

/**
 * 코드 만료 여부 확인
 * @param expiresAt 만료 시간 (ISO 문자열)
 * @returns 만료 여부
 */
export function isCodeExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

/**
 * 코드 사용 가능 여부 확인
 * @param usageCount 현재 사용 횟수
 * @param maxUsage 최대 사용 횟수 (null이면 무제한)
 * @returns 사용 가능 여부
 */
export function canUseCode(usageCount: number, maxUsage?: number): boolean {
  if (maxUsage === null || maxUsage === undefined) return true
  return usageCount < maxUsage
}
