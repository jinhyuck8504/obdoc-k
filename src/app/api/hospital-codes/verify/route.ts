import { NextRequest, NextResponse } from 'next/server'
import { verifyHospitalCode } from '@/lib/hospitalCodeService'
import { ERROR_MESSAGES } from '@/types/hospitalCode'
import { hospitalCodeRateLimiter, globalRateLimiter } from '@/lib/security/rateLimiter'
import { securityLogger, getClientIp, getUserAgent } from '@/lib/security/securityLogger'

// POST /api/hospital-codes/verify - 병원 코드 검증
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  const userAgent = getUserAgent(request)

  try {
    // 1. 전역 Rate Limiting 체크
    const globalLimit = globalRateLimiter.checkLimit(clientIp)
    if (!globalLimit.allowed) {
      securityLogger.logRateLimitExceeded(clientIp, '/api/hospital-codes/verify', userAgent)
      return NextResponse.json(
        { 
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          resetTime: globalLimit.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': globalLimit.remaining.toString(),
            'X-RateLimit-Reset': globalLimit.resetTime.toString()
          }
        }
      )
    }

    // 2. 병원 코드 전용 Rate Limiting 체크
    const hospitalCodeLimit = hospitalCodeRateLimiter.checkLimit(clientIp)
    if (!hospitalCodeLimit.allowed) {
      securityLogger.logRateLimitExceeded(clientIp, '/api/hospital-codes/verify (hospital-specific)', userAgent)
      return NextResponse.json(
        { 
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          message: '병원 코드 검증 요청이 너무 많습니다. 15분 후 다시 시도해주세요.',
          resetTime: hospitalCodeLimit.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': hospitalCodeLimit.remaining.toString(),
            'X-RateLimit-Reset': hospitalCodeLimit.resetTime.toString()
          }
        }
      )
    }

    // 3. 요청 본문 파싱
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      securityLogger.logSuspiciousActivity(
        '잘못된 병원 코드 검증 요청 - 코드 누락',
        clientIp,
        undefined,
        { requestBody: body }
      )
      return NextResponse.json(
        { 
          error: 'INVALID_REQUEST',
          message: ERROR_MESSAGES.INVALID_REQUEST
        },
        { status: 400 }
      )
    }

    // 4. 코드 형식 검증
    if (code.length < 6 || code.length > 20) {
      securityLogger.logSuspiciousActivity(
        '잘못된 병원 코드 형식',
        clientIp,
        undefined,
        { code: code.substring(0, 3) + '***' }
      )
      return NextResponse.json(
        { 
          error: 'INVALID_CODE_FORMAT',
          message: ERROR_MESSAGES.INVALID_CODE_FORMAT
        },
        { status: 400 }
      )
    }

    // 5. 병원 코드 검증
    const verificationResult = await verifyHospitalCode(code)

    if (!verificationResult.isValid) {
      // 실패 로깅
      securityLogger.logSuspiciousActivity(
        '병원 코드 검증 실패',
        clientIp,
        undefined,
        { 
          code: code.substring(0, 3) + '***',
          reason: verificationResult.error 
        }
      )

      return NextResponse.json(
        { 
          error: verificationResult.error || 'CODE_NOT_FOUND',
          message: verificationResult.error ? ERROR_MESSAGES[verificationResult.error] : ERROR_MESSAGES.CODE_NOT_FOUND,
          isValid: false 
        },
        { status: 400 }
      )
    }

    // 6. 성공 로깅
    securityLogger.log({
      type: 'DATA_ACCESS' as any,
      level: 'LOW' as any,
      message: '병원 코드 검증 성공',
      clientIP: clientIp,
      userAgent,
      metadata: {
        hospitalId: verificationResult.hospitalData?.id,
        hospitalName: verificationResult.hospitalData?.name,
        action: 'hospital_code_verify'
      }
    })

    // 7. 성공 응답
    return NextResponse.json({
      isValid: true,
      hospitalData: verificationResult.hospitalData,
      message: '병원 코드가 확인되었습니다.'
    })

  } catch (error) {
    console.error('병원 코드 검증 중 오류:', error)
    
    // 서버 오류 로깅
    securityLogger.log({
      type: 'SUSPICIOUS_ACTIVITY' as any,
      level: 'HIGH' as any,
      message: '병원 코드 검증 중 서버 오류',
      clientIP: clientIp,
      userAgent,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'hospital_code_verify_error'
      }
    })

    return NextResponse.json(
      { 
        error: 'SERVER_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    )
  }
}

// OPTIONS - CORS 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://obdoc.co.kr' 
        : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
