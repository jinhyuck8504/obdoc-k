import { NextRequest, NextResponse } from 'next/server'
import { verifyHospitalCode } from '@/lib/hospitalCodeService'
import { VerifyHospitalCodeRequest } from '@/types/hospitalCode'

// Rate limiting을 위한 간단한 메모리 저장소
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15분
const RATE_LIMIT_MAX_ATTEMPTS = 5 // 15분 내 최대 5회

function getRateLimitKey(ip: string): string {
  return `verify_${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // 새로운 윈도우 시작
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // 카운트 증가
  record.count++
  return { allowed: true }
}

// POST: 병원 코드 검증
export async function POST(request: NextRequest) {
  try {
    // IP 주소 추출
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting 확인
    const rateLimitResult = checkRateLimit(ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'HOSPITAL_CODE_RATE_LIMIT_EXCEEDED',
          message: '병원 코드 검증 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: rateLimitResult.retryAfter
        }, 
        { status: 429 }
      )
    }

    // 요청 데이터 파싱
    const body: VerifyHospitalCodeRequest = await request.json()
    
    // 필수 필드 검증
    if (!body.code || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code is required' }, 
        { status: 400 }
      )
    }

    // 코드 검증
    const result = await verifyHospitalCode(body.code.trim().toUpperCase())
    
    if (!result.isValid) {
      return NextResponse.json({
        isValid: false,
        message: result.message,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      isValid: true,
      code: result.code
    })
  } catch (error) {
    console.error('POST /api/hospital-codes/verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
