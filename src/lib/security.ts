// 보안 유틸리티 라이브러리

// 임시로 더미 객체 사용 (패키지 설치 전까지)
const DOMPurify = {
  sanitize: (html: string, options?: any) => {
    // 기본적인 XSS 방지 처리
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
}

const CryptoJS = {
  AES: {
    encrypt: (data: string, key: string) => ({ 
      toString: () => Buffer.from(data).toString('base64') 
    }),
    decrypt: (data: any, key: string) => ({ 
      toString: () => {
        try {
          return Buffer.from(data.toString(), 'base64').toString('utf8')
        } catch {
          return data.toString()
        }
      }
    })
  },
  enc: {
    Utf8: {
      stringify: (data: any) => data.toString()
    }
  }
}

// 보안 설정
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15분
  PASSWORD_MIN_LENGTH: 8,
  CSRF_TOKEN_LENGTH: 32,
  ENCRYPTION_KEY_LENGTH: 256,
  SALT_ROUNDS: 12
}

// XSS 보호 클래스
export class XSSProtection {
  // HTML 콘텐츠 정화
  static sanitizeHTML(html: string): string {
    if (typeof window === 'undefined') {
      // 서버 사이드에서는 기본적인 정화만 수행
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
    }
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
      ALLOW_DATA_ATTR: false
    })
  }

  // 텍스트 입력 정화
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // HTML 태그 제거
      .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
      .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 제거
      .trim()
  }

  // URL 검증
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const allowedProtocols = ['http:', 'https:', 'mailto:']
      return allowedProtocols.includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  // SQL 인젝션 방지를 위한 입력 검증
  static validateInput(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /['"`;]/,
      /--/,
      /\/\*/,
      /\*\//
    ]
    
    return !sqlPatterns.some(pattern => pattern.test(input))
  }
}

// CSRF 보호 클래스
export class CSRFProtection {
  private static tokens: Map<string, { token: string; expires: number }> = new Map()

  // CSRF 토큰 생성
  static generateToken(sessionId: string): string {
    const token = this.generateRandomString(SECURITY_CONFIG.CSRF_TOKEN_LENGTH)
    const expires = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT
    
    this.tokens.set(sessionId, { token, expires })
    return token
  }

  // CSRF 토큰 검증
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    if (!stored) return false
    
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId)
      return false
    }
    
    return stored.token === token
  }

  // 만료된 토큰 정리
  static cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId)
      }
    }
  }

  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// 세션 보안 클래스
export class SessionSecurity {
  private static sessions: Map<string, {
    userId: string
    createdAt: number
    lastActivity: number
    ipAddress: string
    userAgent: string
  }> = new Map()

  // 세션 생성
  static createSession(userId: string, ipAddress: string, userAgent: string): string {
    const sessionId = this.generateSessionId()
    const now = Date.now()
    
    this.sessions.set(sessionId, {
      userId,
      createdAt: now,
      lastActivity: now,
      ipAddress,
      userAgent
    })
    
    return sessionId
  }

  // 세션 검증
  static validateSession(sessionId: string, ipAddress: string, userAgent: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    
    // 세션 만료 확인
    if (Date.now() - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId)
      return false
    }
    
    // IP 주소 및 User Agent 검증 (선택적)
    if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
      // 보안상 의심스러운 활동으로 간주할 수 있음
      console.warn('Session validation warning: IP or User Agent mismatch')
    }
    
    // 마지막 활동 시간 업데이트
    session.lastActivity = Date.now()
    return true
  }

  // 세션 삭제
  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  // 사용자의 모든 세션 삭제
  static destroyUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId)
      }
    }
  }

  private static generateSessionId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  private static getEncryptionKey(): string {
    // 실제 환경에서는 환경 변수에서 가져와야 함
    return process.env.NEXT_PUBLIC_SESSION_KEY || 'default-session-key-change-in-production'
  }
}

// 감사 로그 인터페이스
interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  details: any
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// 감사 로깅 클래스
export class AuditLogger {
  private static logs: AuditLog[] = []

  // 로그 기록
  static log(
    userId: string,
    action: string,
    resource: string,
    details: any = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const log: AuditLog = {
      id: this.generateLogId(),
      userId,
      action,
      resource,
      details,
      ipAddress: this.getClientIP(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: new Date().toISOString(),
      severity
    }

    this.logs.push(log)
    
    // 로그가 너무 많이 쌓이지 않도록 제한
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000) // 최근 5000개만 유지
    }

    // 심각한 보안 이벤트는 즉시 알림
    if (severity === 'critical') {
      this.alertSecurityTeam(log)
    }
  }

  // 로그 조회
  static getLogs(filters?: {
    userId?: string
    action?: string
    severity?: string
    startDate?: string
    endDate?: string
  }): AuditLog[] {
    let filteredLogs = [...this.logs]

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action!))
      }
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity)
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!)
      }
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  private static generateLogId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private static getClientIP(): string {
    // 실제 환경에서는 요청 헤더에서 IP를 가져와야 함
    return 'unknown'
  }

  private static alertSecurityTeam(log: AuditLog): void {
    // 실제 환경에서는 보안팀에 알림을 보내는 로직 구현
    console.error('CRITICAL SECURITY EVENT:', log)
  }
}

// 비밀번호 보안 클래스
export class PasswordSecurity {
  // 비밀번호 강도 검사
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // 길이 검사
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      feedback.push(`비밀번호는 최소 ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)
    } else {
      score += 1
    }

    // 대문자 포함 검사
    if (!/[A-Z]/.test(password)) {
      feedback.push('대문자를 포함해야 합니다.')
    } else {
      score += 1
    }

    // 소문자 포함 검사
    if (!/[a-z]/.test(password)) {
      feedback.push('소문자를 포함해야 합니다.')
    } else {
      score += 1
    }

    // 숫자 포함 검사
    if (!/\d/.test(password)) {
      feedback.push('숫자를 포함해야 합니다.')
    } else {
      score += 1
    }

    // 특수문자 포함 검사
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('특수문자를 포함해야 합니다.')
    } else {
      score += 1
    }

    // 일반적인 패턴 검사
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i
    ]

    if (commonPatterns.some(pattern => pattern.test(password))) {
      feedback.push('일반적인 패턴은 사용할 수 없습니다.')
      score -= 1
    }

    return {
      isValid: score >= 4 && feedback.length === 0,
      score: Math.max(0, score),
      feedback
    }
  }

  // 비밀번호 해시 (실제로는 bcrypt 등을 사용해야 함)
  static async hashPassword(password: string): Promise<string> {
    // 실제 환경에서는 bcrypt 등의 라이브러리 사용
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'salt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // 비밀번호 검증
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }
}

// 입력 검증 클래스
export class InputValidation {
  // 이메일 검증
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // 전화번호 검증 (한국 형식)
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // 사업자등록번호 검증
  static validateBusinessNumber(number: string): boolean {
    const cleanNumber = number.replace(/[^0-9]/g, '')
    if (cleanNumber.length !== 10) return false

    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
    let sum = 0

    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNumber[i]) * weights[i]
    }

    const remainder = sum % 10
    const checkDigit = remainder === 0 ? 0 : 10 - remainder
    
    return checkDigit === parseInt(cleanNumber[9])
  }

  // 파일 업로드 검증
  static validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 파일 타입 검증
    if (!allowedTypes.includes(file.type)) {
      errors.push(`허용되지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`)
    }

    // 파일 크기 검증
    if (file.size > maxSize) {
      errors.push(`파일 크기가 너무 큽니다. 최대 크기: ${maxSize / 1024 / 1024}MB`)
    }

    // 파일명 검증
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('파일명에 특수문자가 포함되어 있습니다.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// 보안 헤더 설정
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// 보안 유틸리티 함수들
export const SecurityUtils = {
  // 안전한 랜덤 문자열 생성
  generateSecureRandom: (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomArray = new Uint8Array(length)
    crypto.getRandomValues(randomArray)
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length]
    }
    return result
  },

  // 시간 기반 공격 방지를 위한 상수 시간 문자열 비교
  constantTimeCompare: (a: string, b: string): boolean => {
    if (a.length !== b.length) return false
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
  },

  // IP 주소 검증
  validateIPAddress: (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }
}
