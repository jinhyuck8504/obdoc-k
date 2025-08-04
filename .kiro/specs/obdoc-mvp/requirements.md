# Requirements Document

## Introduction

Obdoc은 대한민국의 비만 클리닉과 고객들을 연결하는 데이터 기반 소통 및 관리 플랫폼입니다. 비만 관리 후 고객 관리 부재로 인한 높은 이탈률 문제를 해결하고, 고객의 지속적인 동기 부여를 제공하여 목표 달성률을 높이는 것이 목표입니다. 병원 원장과 고객이 함께 사용하는 통합 플랫폼으로, 극도의 단순함(1-2 Click Rule)과 반응형 웹 디자인을 통해 최적화된 사용자 경험을 제공합니다.

## Requirements

### Requirement 1: 사용자 인증 및 온보딩

**User Story:** As a 병원 원장, I want to register for the service and manage customer accounts, so that I can provide comprehensive obesity management services to my patients.

#### Acceptance Criteria

1. WHEN 원장이 가입 신청을 할 때 THEN 시스템은 병원 유형, 구독 플랜, 세금계산서 정보, 로그인용 이메일, 최초 비밀번호를 입력받아야 한다
2. WHEN 관리자가 가입 신청을 승인할 때 THEN 시스템은 해당 계정을 즉시 활성화하고 원장이 로그인할 수 있도록 해야 한다
3. WHEN 원장이 신규 고객을 등록할 때 THEN 시스템은 고객 정보와 휴대폰 번호(ID), 최초 비밀번호를 받아 즉시 활성화된 계정을 생성해야 한다
4. WHEN 사용자가 로그인할 때 THEN 시스템은 역할에 따라 적절한 대시보드로 리다이렉트해야 한다

### Requirement 2: 원장님 전용 통합 대시보드

**User Story:** As a 병원 원장, I want to see all important information at a glance on my main dashboard, so that I can efficiently manage my practice and patients.

#### Acceptance Criteria

1. WHEN 원장이 로그인할 때 THEN 시스템은 '오늘 할 일', '고객 현황', '일정', '빠른 고객 검색' 위젯을 포함한 대시보드를 표시해야 한다
2. WHEN 원장이 고객 현황을 확인할 때 THEN 시스템은 실시간 감량 데이터를 포함한 고객 상태를 표시해야 한다
3. WHEN 원장이 빠른 검색을 사용할 때 THEN 시스템은 1-2번의 클릭으로 원하는 고객 정보에 접근할 수 있도록 해야 한다
4. WHEN 원장이 일정을 확인할 때 THEN 시스템은 캘린더 형태로 예약 및 중요 일정을 표시해야 한다

### Requirement 3: 고객 전용 대시보드

**User Story:** As a 고객, I want to access my personal health data and interact with the community, so that I can stay motivated and track my progress.

#### Acceptance Criteria

1. WHEN 고객이 로그인할 때 THEN 시스템은 '나의 리포트', '나의 일정', '커뮤니티 바로가기'를 포함한 개인화된 대시보드를 표시해야 한다
2. WHEN 고객이 나의 리포트를 확인할 때 THEN 시스템은 개인의 건강 데이터와 진행 상황을 시각적으로 표시해야 한다
3. WHEN 고객이 일정을 확인할 때 THEN 시스템은 병원 예약 및 개인 일정을 표시해야 한다
4. WHEN 고객이 커뮤니티에 접근할 때 THEN 시스템은 1-2번의 클릭으로 커뮤니티 페이지로 이동할 수 있도록 해야 한다

### Requirement 4: 고객 커뮤니티 (MVP)

**User Story:** As a 고객, I want to participate in a supportive community with other patients, so that I can stay motivated and share my journey.

#### Acceptance Criteria

1. WHEN 고객이 커뮤니티에 접근할 때 THEN 시스템은 '성공 다이어트 챌린지' 게시판을 표시해야 한다
2. WHEN 고객이 게시글을 작성할 때 THEN 시스템은 익명 닉네임을 사용하고 태그를 통한 분류를 지원해야 한다
3. WHEN 고객이 소통할 때 THEN 시스템은 글 작성, 댓글, 이미지 업로드, 응원 기능을 제공해야 한다
4. WHEN 부적절한 콘텐츠가 신고될 때 THEN 시스템은 사용자 신고 기능과 관리자 검토 프로세스를 제공해야 한다
5. WHEN 관리자가 공지사항을 게시할 때 THEN 시스템은 공지사항을 우선적으로 표시해야 한다

### Requirement 5: 관리자 대시보드

**User Story:** As an Obdoc 운영자, I want to manage the entire service including subscriptions and statistics, so that I can ensure smooth operation and business growth.

#### Acceptance Criteria

1. WHEN 관리자가 대시보드에 접근할 때 THEN 시스템은 통계 분석, 구독 관리, 세금계산서 관리, 공지사항 관리 기능을 제공해야 한다
2. WHEN 관리자가 통계를 확인할 때 THEN 시스템은 병원 유형별 필터링이 가능한 분석 데이터를 표시해야 한다
3. WHEN 관리자가 구독을 관리할 때 THEN 시스템은 승인/거절 처리와 만료일 설정 기능을 제공해야 한다
4. WHEN 관리자가 세금계산서를 관리할 때 THEN 시스템은 발행 및 관리 기능을 제공해야 한다

### Requirement 6: 데이터 관리 및 CRUD 기능

**User Story:** As a 시스템 사용자, I want all data to be properly managed with full CRUD capabilities, so that information can be accurately maintained and updated.

#### Acceptance Criteria

1. WHEN 사용자가 데이터를 생성할 때 THEN 시스템은 적절한 검증을 통해 데이터를 안전하게 저장해야 한다
2. WHEN 사용자가 데이터를 조회할 때 THEN 시스템은 권한에 따라 적절한 데이터만 표시해야 한다
3. WHEN 사용자가 데이터를 수정할 때 THEN 시스템은 변경 사항을 안전하게 업데이트해야 한다
4. WHEN 사용자가 데이터를 삭제할 때 THEN 시스템은 확인 절차를 거쳐 안전하게 삭제해야 한다

### Requirement 7: 보안 및 접근 제어

**User Story:** As a 시스템 관리자, I want robust security measures in place, so that user data is protected and privacy is maintained.

#### Acceptance Criteria

1. WHEN 사용자가 데이터에 접근할 때 THEN 시스템은 Supabase RLS를 통해 적절한 권한만 허용해야 한다
2. WHEN 데이터가 전송될 때 THEN 시스템은 모든 구간에서 SSL 암호화를 사용해야 한다
3. WHEN 개인정보가 처리될 때 THEN 시스템은 개인정보보호법을 완벽히 준수해야 한다
4. WHEN 인증 세션이 관리될 때 THEN 시스템은 안정적인 세션 상태 처리와 로딩 UI를 제공해야 한다

### Requirement 8: 성능 및 사용자 경험

**User Story:** As a 서비스 사용자, I want fast and responsive interactions, so that I can efficiently use the platform without delays.

#### Acceptance Criteria

1. WHEN 사용자가 페이지를 로드할 때 THEN 시스템은 2초 이내에 페이지를 표시해야 한다
2. WHEN 사용자가 핵심 기능을 사용할 때 THEN 시스템은 1-2번의 클릭으로 작업을 완료할 수 있도록 해야 한다
3. WHEN 사용자가 다양한 디바이스에서 접근할 때 THEN 시스템은 PC, 태블릿, 모바일에서 최적화된 반응형 경험을 제공해야 한다
4. WHEN 데이터가 없는 상태일 때 THEN 시스템은 사용자가 다음에 무엇을 해야 할지 명확히 안내하는 Empty State 디자인을 제공해야 한다

### Requirement 9: 구독 및 결제 관리

**User Story:** As a 병원 원장, I want to manage my subscription and payments, so that I can maintain access to the service.

#### Acceptance Criteria

1. WHEN 원장이 구독 플랜을 선택할 때 THEN 시스템은 1개월(199,000원), 6개월(1,015,000원), 12개월(1,791,000원) 옵션을 제공해야 한다
2. WHEN 결제가 진행될 때 THEN 시스템은 무통장 입금 방식을 지원해야 한다
3. WHEN 관리자가 입금을 확인할 때 THEN 시스템은 수동 확인 및 반영 기능을 제공해야 한다
4. WHEN 구독이 만료될 때 THEN 시스템은 적절한 알림과 갱신 안내를 제공해야 한다

### Requirement 10: 법적 준수 및 공통 요소

**User Story:** As a 서비스 제공자, I want to comply with all legal requirements and provide necessary information, so that the service operates within legal boundaries.

#### Acceptance Criteria

1. WHEN 사용자가 서비스 페이지를 방문할 때 THEN 시스템은 모든 페이지 하단에 회사 정보가 포함된 공통 푸터를 표시해야 한다
2. WHEN 사용자가 법적 문서에 접근할 때 THEN 시스템은 이용약관과 개인정보처리방침 페이지를 제공해야 한다
3. WHEN 브랜드가 표시될 때 THEN 시스템은 'Obdoc' 브랜드명과 '비만치료의 흐름을 설계하다' 슬로건을 적절히 배치해야 한다
4. WHEN 에러가 발생할 때 THEN 시스템은 사용자 친화적인 에러 메시지와 복구 방안을 제공해야 한다
