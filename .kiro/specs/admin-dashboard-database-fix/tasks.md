# Implementation Plan

- [ ] 1. 데이터베이스 스키마 긴급 수정
  - Supabase SQL Editor에서 스키마 수정 SQL 실행
  - subscriptions 테이블에 plan 컬럼 추가 및 데이터 동기화
  - reports 테이블 생성 및 RLS 정책 설정
  - 샘플 데이터 삽입으로 기능 테스트 가능하도록 설정
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 2. adminService.ts 쿼리 수정
  - subscriptions 테이블 쿼리에서 올바른 컬럼명 사용
  - plan_type 컬럼 참조로 변경하여 400 에러 해결
  - 에러 핸들링 로직 개선
  - _Requirements: 1.1, 1.3, 4.1, 4.2_

- [ ] 3. Supabase 클라이언트 싱글톤 패턴 적용
  - supabase.ts에서 중복 인스턴스 생성 방지
  - GoTrueClient 경고 메시지 제거
  - 인증 상태 관리 최적화
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. 관리자 대시보드 기능 검증
  - 통계 탭에서 구독 데이터 정상 표시 확인
  - 모더레이션 탭에서 신고 목록 정상 표시 확인
  - 콘솔 에러 및 무한 로딩 문제 해결 확인
  - _Requirements: 1.4, 2.3, 2.4, 5.4_

- [ ] 5. 프로덕션 배포 준비 완료
  - 모든 에러 로그 제거 확인
  - 관리자 기능 정상 작동 확인
  - 정식 서비스 배포 준비 상태 검증
  - _Requirements: 4.3, 4.4_
