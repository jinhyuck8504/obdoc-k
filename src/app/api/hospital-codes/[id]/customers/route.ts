import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getCodeUsageHistory } from '@/lib/hospitalCodeService'

// GET: 코드별 가입 고객 목록 조회
export async function GET(
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

    // 사용 기록 조회
    const usageHistory = await getCodeUsageHistory(params.id, user.id)
    
    return NextResponse.json({ customers: usageHistory })
  } catch (error) {
    console.error('GET /api/hospital-codes/[id]/customers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
