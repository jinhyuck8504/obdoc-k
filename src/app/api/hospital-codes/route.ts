// 병원 가입 코드 검증 API

import { NextRequest, NextResponse } from 'next/server'
import { verifyHospitalCode } from '@/lib/hospitalCodeService'
import { ERROR_MESSAGES } from '@/types/hospitalCode'
import { hospitalCodeRateLimiter, globalRateLimiter } from '@/lib/security/rateLimiter'
import { securityLogger, getClientIp, getUserAgent } from '@/lib/security/securityLogger'

// POST /api/hospital-codes/verify - 코드 검증
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  const userAgent = getUserAgent(request)

  try {
    // 1. 전역 Rate Limiting 체크
    const globalLimit = globalRateLimiter.check(clientIp)
    if (!globalLimit.allowed) {
      securityLogger.logRateLimitExceeded(clientIp, '/api/hospital-codes/verify', userAgent)
      
      return NextResponse.json(
        { 
          error: 'RATE_LIMIT_EXCEEDED',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((globalLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': globalLimit.remaining.toString(),
            'X-RateLimit-Reset': globalLimit.resetTime.toString(),
            'Retry-After': Math.ceil((globalLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // 2. 병원 코드 전용 Rate Limiting 체크
    const codeLimit = hospitalCodeRateLimiter.check(`hospital_code:${clientIp}`)
    if (!codeLimit.allowed) {
      // 브루트포스 공격 의심 로깅
      const ipStats = securityLogger.getIpStats(clientIp)
      securityLogger.logBruteForceAttempt(clientIp, ipStats.failedAttempts + 1, userAgent)
      
      return NextResponse.json(
        { 
          error: 'HOSPITAL_CODE_RATE_LIMIT_EXCEEDED',
          message: codeLimit.blocked 
            ? '병원 코드 검증 시도가 너무 많습니다. 30분 후 다시 시도해주세요.'
            : '병원 코드 검증 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((codeLimit.resetTime - Date.now()) / 1000),
          blocked: codeLimit.blocked
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': codeLimit.remaining.toString(),
            'X-RateLimit-Reset': codeLimit.resetTime.toString(),
            'Retry-After': Math.ceil((codeLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // 3. 요청 데이터 검증
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      securityLogger.logSuspiciousActivity(
        clientIp, 
        'invalid_hospital_code_format', 
        { providedCode: typeof code, bodyKeys: Object.keys(body) },
        userAgent
      )
      
      return NextResponse.json(
        { 
          error: 'INVALID_FORMAT',
          message: ERROR_MESSAGES.INVALID_FORMAT 
        },
        { status: 400 }
      )
    }

    // 4. 코드 형식 기본 검증 (8자리 영숫자)
    const codePattern = /^[A-Z0-9]{8}$/
    if (!codePattern.test(code)) {
      securityLogger.logHospitalCodeFailure(clientIp, code, 'invalid_format', userAgent)
      
      return NextResponse.json(
        {
          error: 'INVALID_FORMAT',
          message: ERROR_MESSAGES.INVALID_FORMAT
        },
        { status: 400 }
      )
    }

    // 5. 코드 검증
    const result = await verifyHospitalCode(code)

    if (!result.isValid) {
      // 실패 로깅
      securityLogger.logHospitalCodeFailure(clientIp, code, result.error!, userAgent)
      
      return NextResponse.json(
        {
          error: result.error,
          message: ERROR_MESSAGES[result.error!]
        },
        { status: 400 }
      )
    }

    // 6. 성공 로깅
    securityLogger.logHospitalCodeSuccess(clientIp, code, undefined, userAgent)

    // 성공 시 코드 정보 반환 (민감한 정보 제외)
    return NextResponse.json({
      isValid: true,
      code: {
        id: result.code!.id,
        code: result.code!.code,
        name: result.code!.name,
        isActive: result.code!.isActive
      }
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': codeLimit.remaining.toString(),
        'X-RateLimit-Reset': codeLimit.resetTime.toString()
      }
    })
  } catch (error) {
    console.error('POST /api/hospital-codes/verify error:', error)
    
    // 서버 오류도 로깅
    securityLogger.logSuspiciousActivity(
      clientIp,
      'server_error_in_hospital_code_verification',
      { error: error instanceof Error ? error.message : 'unknown_error' },
      userAgent
    )
    
    return NextResponse.json(
      { 
        error: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}
