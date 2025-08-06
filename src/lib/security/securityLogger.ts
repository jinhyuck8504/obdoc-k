// 보안 로깅 유틸리티
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  IP_BLOCKED = 'IP_BLOCKED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_ACCESS = 'DATA_ACCESS',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

export enum SecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface SecurityEvent {
  id: string
  timestamp: string
  type: SecurityEventType
  level: SecurityLevel
  message: string
  clientIP?: string
  userAgent?: string
  userId?: string
  metadata?: Record<string, any>
}

class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 1000 // 메모리에 보관할 최대 이벤트 수

  // 보안 이벤트 로깅
  log(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...event
    }

    // 메모리에 저장
    this.events.unshift(securityEvent)
    
    // 최대 개수 초과시 오래된 이벤트 제거
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // 콘솔에 출력 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${event.level}: ${event.message}`, {
        type: event.type,
        clientIP: event.clientIP,
        userId: event.userId,
        metadata: event.metadata
      })
    }

    // 프로덕션 환경에서는 외부 로깅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(securityEvent)
    }
  }

  // 로그인 성공 로깅
  logLoginSuccess(userId: string, clientIP: string, userAgent?: string): void {
    this.log({
      type: SecurityEventType.LOGIN_SUCCESS,
      level: SecurityLevel.LOW,
      message: `사용자 로그인 성공: ${userId}`,
      clientIP,
      userAgent,
      userId,
      metadata: { action: 'login' }
    })
  }

  // 로그인 실패 로깅
  logLoginFailure(email: string, clientIP: string, userAgent?: string, reason?: string): void {
    this.log({
      type: SecurityEventType.LOGIN_FAILURE,
      level: SecurityLevel.MEDIUM,
      message: `로그인 실패: ${email} - ${reason || '잘못된 자격증명'}`,
      clientIP,
      userAgent,
      metadata: { email, reason, action: 'login_failed' }
    })
  }

  // Rate Limit 초과 로깅
  logRateLimitExceeded(clientIP: string, endpoint: string, userAgent?: string): void {
    this.log({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      level: SecurityLevel.HIGH,
      message: `Rate limit 초과: ${endpoint}`,
      clientIP,
      userAgent,
      metadata: { endpoint, action: 'rate_limit_exceeded' }
    })
  }

  // 의심스러운 활동 로깅
  logSuspiciousActivity(description: string, clientIP: string, userId?: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      level: SecurityLevel.HIGH,
      message: `의심스러운 활동 감지: ${description}`,
      clientIP,
      userId,
      metadata: { ...metadata, action: 'suspicious_activity' }
    })
  }

  // IP 차단 로깅
  logIPBlocked(clientIP: string, reason: string): void {
    this.log({
      type: SecurityEventType.IP_BLOCKED,
      level: SecurityLevel.CRITICAL,
      message: `IP 주소 차단: ${clientIP} - ${reason}`,
      clientIP,
      metadata: { reason, action: 'ip_blocked' }
    })
  }

  // 무단 접근 시도 로깅
  logUnauthorizedAccess(resource: string, clientIP: string, userId?: string, userAgent?: string): void {
    this.log({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      level: SecurityLevel.HIGH,
      message: `무단 접근 시도: ${resource}`,
      clientIP,
      userAgent,
      userId,
      metadata: { resource, action: 'unauthorized_access' }
    })
  }

  // 관리자 작업 로깅
  logAdminAction(action: string, adminId: string, targetId?: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.ADMIN_ACTION,
      level: SecurityLevel.MEDIUM,
      message: `관리자 작업: ${action}`,
      userId: adminId,
      metadata: { action, targetId, ...metadata }
    })
  }

  // 최근 이벤트 조회
  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(0, limit)
  }

  // 특정 타입의 이벤트 조회
  getEventsByType(type: SecurityEventType, limit = 50): SecurityEvent[] {
    return this.events.filter(event => event.type === type).slice(0, limit)
  }

  // 특정 레벨 이상의 이벤트 조회
  getEventsByLevel(minLevel: SecurityLevel, limit = 50): SecurityEvent[] {
    const levelOrder = {
      [SecurityLevel.LOW]: 0,
      [SecurityLevel.MEDIUM]: 1,
      [SecurityLevel.HIGH]: 2,
      [SecurityLevel.CRITICAL]: 3
    }

    const minLevelValue = levelOrder[minLevel]
    
    return this.events
      .filter(event => levelOrder[event.level] >= minLevelValue)
      .slice(0, limit)
  }

  // 통계 정보 조회
  getStats(): {
    totalEvents: number
    eventsByType: Record<SecurityEventType, number>
    eventsByLevel: Record<SecurityLevel, number>
    recentActivity: SecurityEvent[]
  } {
    const eventsByType = {} as Record<SecurityEventType, number>
    const eventsByLevel = {} as Record<SecurityLevel, number>

    // 타입별, 레벨별 카운트
    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsByLevel[event.level] = (eventsByLevel[event.level] || 0) + 1
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsByLevel,
      recentActivity: this.getRecentEvents(10)
    }
  }

  // ID 생성
  private generateId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 외부 로깅 서비스로 전송 (프로덕션용)
  private async sendToExternalLogger(event: SecurityEvent): Promise<void> {
    try {
      // 여기에 Sentry, LogRocket, 또는 다른 로깅 서비스 연동
      // 예: Sentry
      // Sentry.addBreadcrumb({
      //   message: event.message,
      //   level: event.level.toLowerCase() as any,
      //   data: event.metadata
      // })
      
      console.log('[SECURITY LOG]', event)
    } catch (error) {
      console.error('Failed to send security log to external service:', error)
    }
  }
}

// 싱글톤 인스턴스
export const securityLogger = new SecurityLogger()

// 클라이언트 IP 추출 유틸리티 함수
export function getClientIp(request: Request): string {
  // Netlify의 경우
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // 기타 헤더들 확인
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // 기본값
  return 'unknown'
}

// User Agent 추출 유틸리티 함수
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

// 요청에서 보안 관련 정보 추출하는 헬퍼 함수
export function extractSecurityInfo(request: Request) {
  return {
    clientIP: getClientIp(request),
    userAgent: getUserAgent(request),
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  }
}

// 보안 이벤트를 요청 정보와 함께 로깅하는 편의 함수
export function logSecurityEventFromRequest(
  request: Request,
  event: Omit<SecurityEvent, 'id' | 'timestamp' | 'clientIP' | 'userAgent'>
) {
  const securityInfo = extractSecurityInfo(request)
  
  securityLogger.log({
    ...event,
    clientIP: securityInfo.clientIP,
    userAgent: securityInfo.userAgent,
    metadata: {
      ...event.metadata,
      url: securityInfo.url,
      method: securityInfo.method
    }
  })
}

// 편의 함수들
export const logLoginSuccess = (userId: string, clientIP: string, userAgent?: string) => 
  securityLogger.logLoginSuccess(userId, clientIP, userAgent)

export const logLoginFailure = (email: string, clientIP: string, userAgent?: string, reason?: string) => 
  securityLogger.logLoginFailure(email, clientIP, userAgent, reason)

export const logRateLimitExceeded = (clientIP: string, endpoint: string, userAgent?: string) => 
  securityLogger.logRateLimitExceeded(clientIP, endpoint, userAgent)

export const logSuspiciousActivity = (description: string, clientIP: string, userId?: string, metadata?: Record<string, any>) => 
  securityLogger.logSuspiciousActivity(description, clientIP, userId, metadata)

export const logIPBlocked = (clientIP: string, reason: string) => 
  securityLogger.logIPBlocked(clientIP, reason)

export const logUnauthorizedAccess = (resource: string, clientIP: string, userId?: string, userAgent?: string) => 
  securityLogger.logUnauthorizedAccess(resource, clientIP, userId, userAgent)

export const logAdminAction = (action: string, adminId: string, targetId?: string, metadata?: Record<string, any>) => 
  securityLogger.logAdminAction(action, adminId, targetId, metadata)

export default securityLogger
