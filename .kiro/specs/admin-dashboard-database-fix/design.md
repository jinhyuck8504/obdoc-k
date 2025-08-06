# Design Document

## Overview

관리자 대시보드의 데이터베이스 연결 문제를 긴급 수정하여 정식 서비스 배포 전에 모든 기능이 정상 작동하도록 합니다. 주요 문제는 스키마 불일치, 누락된 테이블, 그리고 Supabase 클라이언트 중복 초기화입니다.

## Architecture

### Database Schema Alignment
- `subscriptions` 테이블의 `plan` 컬럼 추가 (기존 `plan_type` 유지)
- `reports` 테이블 생성 및 RLS 정책 설정
- 샘플 데이터 삽입으로 기능 테스트 가능

### Application Code Updates
- `adminService.ts`에서 올바른 컬럼명 사용
- Supabase 클라이언트 싱글톤 패턴 적용
- 에러 핸들링 개선

## Components and Interfaces

### 1. Database Schema Updates
```sql
-- subscriptions 테이블 컬럼 추가
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan TEXT;
UPDATE subscriptions SET plan = plan_type WHERE plan IS NULL;

-- reports 테이블 생성
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_content_id UUID,
  content_type TEXT CHECK (content_type IN ('post', 'comment', 'user')),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. AdminService Query Fixes
- `plan_type` 컬럼 사용으로 변경
- 에러 핸들링 강화
- 빈 데이터 상황 대응

### 3. Supabase Client Optimization
- 싱글톤 패턴으로 중복 인스턴스 방지
- 인증 상태 관리 개선
- 콘솔 로그 정리

## Data Models

### Subscription Model
```typescript
interface Subscription {
  id: string
  doctor_id: string
  plan_type: '1month' | '6month' | '12month'  // 기존 컬럼
  plan: '1month' | '6month' | '12month'       // 새 컬럼 (호환성)
  status: 'active' | 'inactive' | 'cancelled'
  payment_status: 'paid' | 'pending' | 'failed'
  amount: number
  start_date: string
  end_date: string
  created_at: string
}
```

### Report Model
```typescript
interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reported_content_id?: string
  content_type: 'post' | 'comment' | 'user'
  reason: string
  description?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  admin_notes?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}
```

## Error Handling

### Database Connection Errors
- 400 에러: 스키마 불일치 → 컬럼명 수정
- 404 에러: 테이블 없음 → 테이블 생성
- 빈 데이터: 샘플 데이터 삽입

### Client-Side Error Handling
- Supabase 클라이언트 초기화 에러 → 싱글톤 패턴
- 인증 상태 변경 에러 → 상태 관리 개선
- 콘솔 경고 → 로그 레벨 조정

## Testing Strategy

### Database Testing
1. 스키마 변경 후 쿼리 실행 테스트
2. 샘플 데이터 삽입 후 조회 테스트
3. RLS 정책 동작 확인

### Application Testing
1. 관리자 대시보드 통계 탭 로딩 테스트
2. 모더레이션 탭 신고 목록 표시 테스트
3. 에러 상황 핸들링 테스트

### Production Readiness
1. 콘솔 에러/경고 제거 확인
2. 데이터 로딩 성능 확인
3. 관리자 권한 접근 제어 확인

## Implementation Priority

### Phase 1: 긴급 수정 (지금 즉시)
1. Supabase SQL 실행으로 스키마 수정
2. adminService.ts 컬럼명 수정
3. Supabase 클라이언트 싱글톤 적용

### Phase 2: 검증 및 테스트
1. 관리자 대시보드 기능 테스트
2. 에러 로그 확인 및 정리
3. 성능 최적화

### Phase 3: 정식 서비스 준비
1. 테스트 데이터 정리
2. 프로덕션 데이터 검증
3. 최종 배포 준비
