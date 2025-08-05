// 병원 가입 코드 검증 API

import { NextRequest, NextResponse } from 'next/server'
import { verifyHospitalCode } from '@/lib/hospitalCodeService'
import { ERROR_MESSAGES } from '@/types/hospitalCode'

// POST /api/hospital-codes/verify - 코드 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { 
          error: 'INVALID_FORMAT',
          message: ERROR_MESSAGES.INVALID_FORMAT 
        },
        { status: 400 }
      )
    }

    // 코드 검증
    const result = await verifyHospitalCode(code)

    if (!result.isValid) {
      return NextResponse.json(
        {
          error: result.error,
          message: ERROR_MESSAGES[result.error!]
        },
        { status: 400 }
      )
    }

    // 성공 시 코드 정보 반환 (민감한 정보 제외)
    return NextResponse.json({
      isValid: true,
      code: {
        id: result.code!.id,
        code: result.code!.code,
        name: result.code!.name,
        isActive: result.code!.isActive
      }
    })
  } catch (error) {
    console.error('POST /api/hospital-codes/verify error:', error)
    return NextResponse.json(
      { 
        error: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}
