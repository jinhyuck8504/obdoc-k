# Obdoc MVP

비만 클리닉과 고객을 연결하는 데이터 기반 소통 및 관리 플랫폼

## 🎯 프로젝트 개요

Obdoc은 대한민국의 비만 클리닉과 고객들을 연결하는 통합 플랫폼입니다. 비만 관리 후 고객 관리 부재로 인한 높은 이탈률 문제를 해결하고, 고객의 지속적인 동기 부여를 제공하여 목표 달성률을 높이는 것이 목표입니다.

## 🚀 주요 기능

- **원장님 전용 대시보드**: 환자 관리, 일정 관리, 빠른 검색
- **고객 전용 대시보드**: 개인 건강 데이터, 예약 관리, 커뮤니티 접근
- **고객 커뮤니티**: 성공 다이어트 챌린지, 익명 소통
- **관리자 대시보드**: 구독 관리, 통계 분석, 세금계산서 관리

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Netlify
- **UI Components**: Lucide React, React Hook Form, Zod

## 📱 사용자 역할

1. **병원 원장**: 환자 관리 및 병원 운영
2. **고객(환자)**: 건강 데이터 확인 및 커뮤니티 참여
3. **관리자**: 서비스 전체 관리 및 구독 승인

## 🔧 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 🚀 프로덕션 런칭

### 자동 런칭 스크립트 사용
```bash
# Windows PowerShell에서 실행
.\scripts\launch-production.ps1
```

### 수동 배포
```bash
# 프로덕션 빌드
npm run build

# GitHub에 푸시 (자동 배포)
git push origin main
```

**프로덕션 URL**: [https://obdoc-mvp.netlify.app](https://obdoc-mvp.netlify.app)

## 📋 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.