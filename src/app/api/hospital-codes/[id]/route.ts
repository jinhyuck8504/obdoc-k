import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { toggleHospitalCodeStatus, deleteHospitalCode } from '@/lib/hospitalCodeService'

// PUT: 병원 코드 수정 (활성화/비활성화)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const body = await request.json()
    const { is_active } = body

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' }, 
        { status: 400 }
      )
    }

    // 코드 상태 변경
    const success = await toggleHospitalCodeStatus(params.id, is_active, user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update code status' }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/hospital-codes/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE: 병원 코드 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 코드 삭제
    const success = await deleteHospitalCode(params.id, user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete code' }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/hospital-codes/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
