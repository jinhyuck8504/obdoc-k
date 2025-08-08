import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createHospitalCode, getDoctorHospitalCodes } from '@/lib/hospitalCodeService'
import { CreateHospitalCodeRequest } from '@/types/hospitalCode'

// GET: 의사의 병원 코드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // 의사 권한 확인
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'Doctor access required' }, 
        { status: 403 }
      )
    }

    // 코드 목록 조회
    const codes = await getDoctorHospitalCodes(user.id)
    
    return NextResponse.json({ codes })
  } catch (error) {
    console.error('GET /api/hospital-codes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST: 새 병원 코드 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // 의사 권한 확인
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'Doctor access required' }, 
        { status: 403 }
      )
    }

    // 요청 데이터 파싱
    const body: CreateHospitalCodeRequest = await request.json()
    
    // 필수 필드 검증
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code name is required' }, 
        { status: 400 }
      )
    }

    // 코드 생성
    const result = await createHospitalCode(user.id, body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message }, 
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('POST /api/hospital-codes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
