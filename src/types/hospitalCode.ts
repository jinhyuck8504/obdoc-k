// 병원 코드 관련 타입 정의

export interface HospitalData {
  id: string
  name: string
  type: string
  address?: string
  phone?: string
  email?: string
  website?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HospitalCode {
  id: string
  code: string
  hospitalId: string
  hospitalData?: HospitalData
  isActive: boolean
  expiresAt?: string
  usageCount: number
  maxUsage?: number
  createdAt: string
  updatedAt: string
}

export interface CodeVerificationResult {
  isValid: boolean
  hospitalData?: HospitalData
  error?: CodeVerificationError
  message?: string
}

export interface HospitalCodeCreateData {
  hospitalId: string
  expiresAt?: string
  maxUsage?: number
  description?: string
}

export interface HospitalCodeUpdateData {
  isActive?: boolean
  expiresAt?: string
  maxUsage?: number
  description?: string
}

// 에러 타입 정의
export type CodeVerificationError = 
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'CODE_INACTIVE'
  | 'USAGE_LIMIT_EXCEEDED'
  | 'HOSPITAL_NOT_FOUND'
  | 'HOSPITAL_INACTIVE'
  | 'INVALID_REQUEST'
  | 'INVALID_CODE_FORMAT'
  | 'SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMIT_EXCEEDED'

// 에러 메시지 매핑
export const ERROR_MESSAGES: Record<CodeVerificationError, string> = {
  INVALID_CODE: '유효하지 않은 병원 코드입니다.',
  CODE_EXPIRED: '만료된 병원 코드입니다.',
  CODE_INACTIVE: '비활성화된 병원 코드입니다.',
  USAGE_LIMIT_EXCEEDED: '병원 코드 사용 한도를 초과했습니다.',
  HOSPITAL_NOT_FOUND: '병원 정보를 찾을 수 없습니다.',
  HOSPITAL_INACTIVE: '비활성화된 병원입니다.',
  INVALID_REQUEST: '잘못된 요청입니다.',
  INVALID_CODE_FORMAT: '병원 코드 형식이 올바르지 않습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNAUTHORIZED: '권한이 없습니다.',
  RATE_LIMIT_EXCEEDED: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
}

// 병원 타입 정의
export type HospitalType = 
  | '종합병원'
  | '병원'
  | '의원'
  | '치과병원'
  | '치과의원'
  | '한방병원'
  | '한의원'
  | '요양병원'
  | '정신병원'
  | '재활병원'
  | '산부인과'
  | '소아과'
  | '내과'
  | '외과'
  | '정형외과'
  | '신경외과'
  | '성형외과'
  | '피부과'
  | '안과'
  | '이비인후과'
  | '비뇨기과'
  | '정신건강의학과'
  | '가정의학과'
  | '응급의학과'
  | '마취통증의학과'
  | '영상의학과'
  | '병리과'
  | '진단검사의학과'
  | '핵의학과'
  | '방사선종양학과'
  | '재활의학과'
  | '예방의학과'
  | '직업환경의학과'
  | '비만클리닉'
  | '기타'

// 병원 코드 생성 옵션
export interface CodeGenerationOptions {
  length?: number
  includeNumbers?: boolean
  includeLetters?: boolean
  excludeSimilar?: boolean
  prefix?: string
  suffix?: string
}

// 병원 코드 통계
export interface HospitalCodeStats {
  totalCodes: number
  activeCodes: number
  expiredCodes: number
  usedCodes: number
  unusedCodes: number
  totalUsage: number
  averageUsage: number
  codesByHospitalType: Record<HospitalType, number>
  recentActivity: {
    date: string
    verifications: number
    newCodes: number
  }[]
}

// 병원 코드 필터 옵션
export interface HospitalCodeFilters {
  isActive?: boolean
  hospitalType?: HospitalType
  expiresAfter?: string
  expiresBefore?: string
  usageMin?: number
  usageMax?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'expiresAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// API 응답 타입
export interface HospitalCodeListResponse {
  hospitalCodes: HospitalCode[]
  total: number
  hasMore: boolean
  filters: HospitalCodeFilters
}

export interface HospitalCodeCreateResponse {
  hospitalCode: HospitalCode
  message: string
}

export interface HospitalCodeUpdateResponse {
  hospitalCode: HospitalCode
  message: string
}

export interface HospitalCodeDeleteResponse {
  success: boolean
  message: string
}

// 병원 코드 검증 요청
export interface CodeVerificationRequest {
  code: string
  clientInfo?: {
    userAgent?: string
    ipAddress?: string
    timestamp?: string
  }
}

// 병원 코드 배치 작업
export interface BatchCodeOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'extend'
  codeIds: string[]
  options?: {
    expiresAt?: string
    maxUsage?: number
  }
}

export interface BatchCodeOperationResult {
  success: boolean
  processedCount: number
  failedCount: number
  errors: {
    codeId: string
    error: string
  }[]
  message: string
}

// 병원 코드 사용 로그
export interface HospitalCodeUsageLog {
  id: string
  codeId: string
  hospitalId: string
  userId?: string
  clientIP?: string
  userAgent?: string
  success: boolean
  error?: CodeVerificationError
  timestamp: string
  metadata?: Record<string, any>
}

// 병원 코드 알림 설정
export interface HospitalCodeNotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  webhookUrl?: string
  notifyOnExpiry: boolean
  notifyOnUsageLimit: boolean
  notifyOnSuspiciousActivity: boolean
  expiryWarningDays: number
}

// 병원 코드 보안 설정
export interface HospitalCodeSecuritySettings {
  maxVerificationAttempts: number
  lockoutDuration: number
  requireClientValidation: boolean
  allowedIpRanges?: string[]
  blockedIpRanges?: string[]
  enableGeolocation: boolean
  enableDeviceFingerprinting: boolean
}

// 내보내기
export type {
  HospitalData,
  HospitalCode,
  CodeVerificationResult,
  HospitalCodeCreateData,
  HospitalCodeUpdateData,
  CodeGenerationOptions,
  HospitalCodeStats,
  HospitalCodeFilters,
  HospitalCodeListResponse,
  HospitalCodeCreateResponse,
  HospitalCodeUpdateResponse,
  HospitalCodeDeleteResponse,
  CodeVerificationRequest,
  BatchCodeOperation,
  BatchCodeOperationResult,
  HospitalCodeUsageLog,
  HospitalCodeNotificationSettings,
  HospitalCodeSecuritySettings
}
