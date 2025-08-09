// 병원 가입 코드 생성 유틸리티

/**
 * 코드 형식 검증
 */
export function validateCodeFormat(code: string): boolean {
  // 8자리 영숫자 형식 검증
  const pattern = /^[A-Z0-9]{8}$/
  return pattern.test(code)
}

/**
 * 코드 정규화
 */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * 랜덤 코드 생성
 */
function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 고유한 코드 생성
 */
export async function generateUniqueCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const code = generateRandomCode()
    const exists = await checkExists(code)
    
    if (!exists) {
      return code
    }
    
    attempts++
  }

  throw new Error('고유한 코드 생성에 실패했습니다.')
}
