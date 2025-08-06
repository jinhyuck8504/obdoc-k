# 🚀 OBDOC MVP 프로덕션 배포 가이드

## 1단계: Supabase 프로젝트 생성

### 1.1 프로젝트 생성
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 설정:
   - **Name**: `obdoc-mvp`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul) - ap-northeast-2`
4. "Create new project" 클릭 후 대기 (2-3분)

### 1.2 API 키 확인
- Settings → API 메뉴에서 다음 값들 복사:
  - **Project URL**: `https://your-project-id.supabase.co`
  - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2단계: 데이터베이스 스키마 배포

### 2.1 스키마 파일 실행 순서
Supabase SQL Editor에서 다음 순서로 실행:

1. **`database/schema.sql`** - 기본 테이블 구조 생성
2. **`database/rls-policies.sql`** - 행 수준 보안 정책 적용
3. **`database/production-init.sql`** - 프로덕션 초기 데이터

### 2.2 실행 방법
1. Supabase 대시보드 → SQL Editor
2. 각 파일 내용을 복사하여 붙여넣기
3. "Run" 버튼 클릭
4. 오류 없이 완료되는지 확인

## 3단계: 관리자 계정 생성

### 3.1 Supabase Auth에서 계정 생성
1. Supabase 대시보드 → Authentication → Users
2. "Add user" 클릭
3. 사용자 정보 입력:
   - **Email**: `admin@obdoc.co.kr`
   - **Password**: `admin123!@#` (나중에 변경 권장)
   - **Email Confirm**: 체크
4. "Create user" 클릭

### 3.2 사용자 ID 확인 및 연결
1. 생성된 사용자의 UUID 복사
2. SQL Editor에서 다음 쿼리 실행:
```sql
UPDATE public.users 
SET id = 'COPIED-UUID-HERE'
WHERE email = 'admin@obdoc.co.kr';
