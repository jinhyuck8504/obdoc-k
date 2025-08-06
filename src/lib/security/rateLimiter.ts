// Rate Limiter 유틸리티
interface RateLimitConfig {
  windowMs: number // 시간 윈도우 (밀리초)
  maxRequests: number // 최대 요청 수
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  // IP 주소에 대한 요청 제한 확인
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // 기존 엔트리가 없거나 시간 윈도우가 지났으면 초기화
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      this.store.set(identifier, newEntry)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    // 요청 수 증가
    entry.count++
    this.store.set(identifier, entry)

    const allowed = entry.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - entry.count)

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    }
  }

  // 특정 식별자의 제한 초기화
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  // 만료된 엔트리 정리
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// 기본 설정들
export const defaultRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  maxRequests: 100 // 15분당 100개 요청
})

export const strictRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  maxRequests: 20 // 15분당 20개 요청
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  maxRequests: 5 // 15분당 5번 로그인 시도
})

// 병원 코드 전용 Rate Limiter
export const hospitalCodeRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  maxRequests: 10 // 15분당 10번 병원 코드 요청
})

// 전역 Rate Limiter (기본값과 동일)
export const globalRateLimiter = defaultRateLimiter

// IP 주소 추출 유틸리티
export function getClientIP(request: Request): string {
  // Netlify의 경우
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // 기타 헤더들 확인
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // 기본값
  return 'unknown'
}

// 미들웨어 함수
export function createRateLimitMiddleware(rateLimiter: RateLimiter) {
  return async (request: Request) => {
    const clientIP = getClientIP(request)
    const result = rateLimiter.checkLimit(clientIP)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          resetTime: result.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    return null // 제한에 걸리지 않음
  }
}

// 정리 작업을 위한 인터벌 설정 (선택사항)
if (typeof window === 'undefined') { // 서버 사이드에서만 실행
  setInterval(() => {
    defaultRateLimiter.cleanup()
    strictRateLimiter.cleanup()
    authRateLimiter.cleanup()
    hospitalCodeRateLimiter.cleanup()
  }, 60 * 1000) // 1분마다 정리
}

export { RateLimiter }
export type { RateLimitConfig, RateLimitEntry }
