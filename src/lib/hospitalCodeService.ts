import { supabase } from './supabase'
import { generateUniqueCode, validateCodeFormat, isCodeExpired, canUseCode } from './codeGenerator'
import { 
  HospitalCode, 
  HospitalCodeUsage, 
  CodeVerificationResult, 
  CreateHospitalCodeRequest,
  CreateHospitalCodeResponse,
  HospitalCodeError,
  ERROR_MESSAGES 
} from '@/types/hospitalCode'

/**
 * 병원 코드 생성
 * @param doctorId 의사 ID
 * @param request 코드 생성 요청 데이터
 * @returns 생성된 코드 정보
 */
export async function createHospitalCode(
  doctorId: string, 
  request: CreateHospitalCodeRequest
): Promise<CreateHospitalCodeResponse> {
  try {
    // 고유한 코드 생성
    const code = await generateUniqueCode()
    if (!code) {
      return {
        success: false,
        message: ERROR_MESSAGES.DUPLICATE_CODE
      }
    }

    // 만료일 검증
    let expiresAt = null
    if (request.expires_at) {
      const expireDate = new Date(request.expires_at)
      if (expireDate <= new Date()) {
        return {
          success: false,
          message: '만료일은 현재 시간보다 이후여야 합니다'
        }
      }
      expiresAt = expireDate.toISOString()
    }

    // 데이터베이스에 저장
    const { data, error } = await supabase
      .from('hospital_codes')
      .insert({
        code,
        doctor_id: doctorId,
        name: request.name,
        max_usage: request.max_usage || null,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (error) {
      console.error('Hospital code creation error:', error)
      return {
        success: false,
        message: '코드 생성 중 오류가 발생했습니다'
      }
    }

    return {
      success: true,
      code: data
    }
  } catch (error) {
    console.error('Unexpected error in createHospitalCode:', error)
    return {
      success: false,
      message: '예상치 못한 오류가 발생했습니다'
    }
  }
}

/**
 * 병원 코드 검증
 * @param code 검증할 코드
 * @returns 검증 결과
 */
export async function verifyHospitalCode(code: string): Promise<CodeVerificationResult> {
  try {
    // 1. 형식 검증
    if (!validateCodeFormat(code)) {
      return {
        isValid: false,
        error: 'INVALID_CODE_FORMAT',
        message: ERROR_MESSAGES.INVALID_CODE_FORMAT
      }
    }

    // 2. 코드 존재 확인
    const { data: hospitalCode, error } = await supabase
      .from('hospital_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !hospitalCode) {
      return {
        isValid: false,
        error: 'CODE_NOT_FOUND',
        message: ERROR_MESSAGES.CODE_NOT_FOUND
      }
    }

    // 3. 활성화 상태 확인
    if (!hospitalCode.is_active) {
      return {
        isValid: false,
        error: 'CODE_INACTIVE',
        message: ERROR_MESSAGES.CODE_INACTIVE
      }
    }

    // 4. 만료일 확인
    if (isCodeExpired(hospitalCode.expires_at)) {
      return {
        isValid: false,
        error: 'CODE_EXPIRED',
        message: ERROR_MESSAGES.CODE_EXPIRED
      }
    }

    // 5. 사용 한도 확인
    if (!canUseCode(hospitalCode.usage_count, hospitalCode.max_usage)) {
      return {
        isValid: false,
        error: 'CODE_USAGE_EXCEEDED',
        message: ERROR_MESSAGES.CODE_USAGE_EXCEEDED
      }
    }

    return {
      isValid: true,
      code: hospitalCode
    }
  } catch (error) {
    console.error('Code verification error:', error)
    return {
      isValid: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
    }
  }
}

/**
 * 의사의 병원 코드 목록 조회
 * @param doctorId 의사 ID
 * @returns 코드 목록
 */
export async function getDoctorHospitalCodes(doctorId: string): Promise<HospitalCode[]> {
  try {
    const { data, error } = await supabase
      .from('hospital_codes')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching doctor hospital codes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getDoctorHospitalCodes:', error)
    return []
  }
}

/**
 * 병원 코드 활성화/비활성화
 * @param codeId 코드 ID
 * @param isActive 활성화 상태
 * @param doctorId 의사 ID (권한 확인용)
 * @returns 성공 여부
 */
export async function toggleHospitalCodeStatus(
  codeId: string, 
  isActive: boolean, 
  doctorId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('hospital_codes')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', codeId)
      .eq('doctor_id', doctorId) // 권한 확인

    if (error) {
      console.error('Error toggling hospital code status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error in toggleHospitalCodeStatus:', error)
    return false
  }
}

/**
 * 코드 사용 기록
 * @param customerId 고객 ID
 * @param hospitalCodeId 병원 코드 ID
 * @returns 성공 여부
 */
export async function recordHospitalCodeUsage(
  customerId: string, 
  hospitalCodeId: string
): Promise<boolean> {
  try {
    // 사용 기록 생성
    const { error: usageError } = await supabase
      .from('customer_hospital_codes')
      .insert({
        customer_id: customerId,
        hospital_code_id: hospitalCodeId
      })

    if (usageError) {
      console.error('Error recording hospital code usage:', usageError)
      return false
    }

    // 사용 횟수 증가
    const { error: incrementError } = await supabase.rpc('increment_code_usage', {
      code_id: hospitalCodeId
    })

    if (incrementError) {
      console.error('Error incrementing code usage:', incrementError)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error in recordHospitalCodeUsage:', error)
    return false
  }
}

/**
 * 코드별 사용 고객 목록 조회
 * @param codeId 코드 ID
 * @param doctorId 의사 ID (권한 확인용)
 * @returns 사용 기록 목록
 */
export async function getCodeUsageHistory(
  codeId: string, 
  doctorId: string
): Promise<HospitalCodeUsage[]> {
  try {
    // 먼저 해당 코드가 의사의 것인지 확인
    const { data: codeData, error: codeError } = await supabase
      .from('hospital_codes')
      .select('id')
      .eq('id', codeId)
      .eq('doctor_id', doctorId)
      .single()

    if (codeError || !codeData) {
      console.error('Unauthorized access to code usage history')
      return []
    }

    // 사용 기록 조회
    const { data, error } = await supabase
      .from('customer_hospital_codes')
      .select(`
        *,
        customers!inner(
          user_id,
          name,
          users!inner(email)
        )
      `)
      .eq('hospital_code_id', codeId)
      .order('used_at', { ascending: false })

    if (error) {
      console.error('Error fetching code usage history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getCodeUsageHistory:', error)
    return []
  }
}

/**
 * 병원 코드 삭제
 * @param codeId 코드 ID
 * @param doctorId 의사 ID (권한 확인용)
 * @returns 성공 여부
 */
export async function deleteHospitalCode(codeId: string, doctorId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('hospital_codes')
      .delete()
      .eq('id', codeId)
      .eq('doctor_id', doctorId) // 권한 확인

    if (error) {
      console.error('Error deleting hospital code:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error in deleteHospitalCode:', error)
    return false
  }
}
