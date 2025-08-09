// 병원 가입 코드 관련 타입 정의
export interface HospitalCode {
  id: string
  code: string
  name: string
  doctorId: string
  maxUses: number | null
  currentUses: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCodeRequest {
  name?: string
  maxUses?: number | null
  expiresAt?: string | null
}

export interface CodeVerificationResult {
  id: string
  code: string
  name: string
  doctorId: string
  hospitalName: string
  hospitalType: string
  maxUses: number | null
  currentUses: number
  expiresAt: string | null
}

export interface CodeCustomer {
  customerId: string
  customerName: string
  customerEmail: string
  usedAt: string
}

export interface HospitalCodeStats {
  totalCodes: number
  activeCodes: number
  inactiveCodes: number
  totalUsage: number
  expiredCodes: number
}

// API 응답 타입들
export interface GetCodesResponse {
  codes: HospitalCode[]
  total: number
}

export interface GetCodeCustomersResponse {
  customers: CodeCustomer[]
  total: number
}

export interface VerifyCodeResponse {
  valid: boolean
  code?: CodeVerificationResult
  error?: string
}

// 폼 데이터 타입들
export interface CodeFormData {
  name: string
  maxUses: string // 폼에서는 문자열로 받음
  expiresAt: string // ISO 날짜 문자열
}

export interface CodeFilterOptions {
  status?: 'all' | 'active' | 'inactive' | 'expired'
  sortBy?: 'created_at' | 'usage_count' | 'name'
  sortOrder?: 'asc' | 'desc'
  search?: string
}
