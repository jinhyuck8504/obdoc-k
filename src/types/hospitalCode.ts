export interface HospitalCode {
  id: string
  code: string
  doctor_id: string
  name: string
  is_active: boolean
  usage_count: number
  max_usage?: number
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface HospitalCodeUsage {
  id: string
  customer_id: string
  hospital_code_id: string
  used_at: string
}

export interface CodeVerificationResult {
  isValid: boolean
  code?: HospitalCode
  message?: string
  error?: string
}

export interface CreateHospitalCodeRequest {
  name: string
  max_usage?: number
  expires_at?: string
}

export interface CreateHospitalCodeResponse {
  success: boolean
  code?: HospitalCode
  message?: string
}

export interface VerifyHospitalCodeRequest {
  code: string
}

export interface VerifyHospitalCodeResponse {
  isValid: boolean
  code?: HospitalCode
  message?: string
  error?: string
}

// 에러 타입 정의
export type HospitalCodeError = 
  | 'INVALID_CODE_FORMAT'
  | 'CODE_NOT_FOUND'
  | 'CODE_INACTIVE'
  | 'CODE_EXPIRED'
  | 'CODE_USAGE_EXCEEDED'
  | 'DUPLICATE_CODE'
  | 'UNAUTHORIZED'
  | 'RATE_LIMIT_EXCEEDED'

export const ERROR_MESSAGES: Record<HospitalCodeError, string> = {
  INVALID_CODE_FORMAT: '코드는 영문 3자리 + 숫자 5자리 형식이어야 합니다 (예: ABC12345)',
  CODE_NOT_FOUND: '존재하지 않는 코드입니다. 병원에서 받은 코드를 다시 확인해주세요',
  CODE_INACTIVE: '비활성화된 코드입니다. 병원에 문의해주세요',
  CODE_EXPIRED: '만료된 코드입니다. 병원에 문의해주세요',
  CODE_USAGE_EXCEEDED: '사용 한도를 초과한 코드입니다. 병원에 문의해주세요',
  DUPLICATE_CODE: '이미 존재하는 코드입니다. 다른 코드를 생성해주세요',
  UNAUTHORIZED: '권한이 없습니다',
  RATE_LIMIT_EXCEEDED: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요'
}
