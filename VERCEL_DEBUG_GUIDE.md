# Vercel 배포 실패 해결 가이드

## 🚨 현재 상황
- 모든 Vercel 배포가 Error 상태
- GitHub Actions는 성공하지만 Vercel 자동 배포 실패
- 로컬: `obdoc-mvp/` vs GitHub: `obdoc-k` 구조 차이

## 🔧 해결 방법

### 1단계: Vercel 프로젝트 설정 확인
1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **obdoc-k 프로젝트 클릭**
3. **Settings > General** 확인

### 2단계: Root Directory 설정 수정
**문제**: Vercel이 잘못된 루트 디렉토리를 보고 있을 수 있음

**해결책**:
1. Vercel 프로젝트 Settings > General
2. **Root Directory** 설정을 확인
3. 현재 설정이 `obdoc-mvp`라면 **`.` (루트)**로 변경
4. 또는 **비워두기** (자동 감지)

### 3단계: Build & Development Settings 확인
**올바른 설정**:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (자동)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 4단계: Environment Variables 확인
**필수 환경변수**:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=your_admin_email
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5단계: package.json 위치 확인
**현재 GitHub 구조**:
```
obdoc-k/
├── package.json ✅ (루트에 있어야 함)
├── src/
├── .github/
└── ...
```

### 6단계: Vercel 재배포 강제 실행
1. Vercel 대시보드에서 **Deployments** 탭
2. 최신 실패한 배포 클릭
3. **Redeploy** 버튼 클릭
4. **Use existing Build Cache** 체크 해제
5. **Redeploy** 실행

### 7단계: GitHub Integration 재연결
만약 위 방법이 안 되면:
1. Vercel Settings > Git
2. **Disconnect** GitHub 연결
3. **Connect** 다시 연결
4. 올바른 리포지토리 선택

## 🎯 가장 가능성 높은 원인

### 원인 1: Root Directory 설정 오류
- Vercel이 `obdoc-mvp` 폴더를 찾으려 하지만 GitHub에는 루트에 파일들이 있음
- **해결**: Root Directory를 `.` 또는 비워두기

### 원인 2: package.json 경로 문제
- Vercel이 `package.json`을 찾지 못함
- **해결**: GitHub 루트에 `package.json` 확인

### 원인 3: Build Command 오류
- 잘못된 빌드 명령어
- **해결**: `npm run build` 확인

## 🚀 즉시 시도할 방법

### 방법 1: Vercel CLI 사용 (추천)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 배포
vercel --prod
```

### 방법 2: 수동 배포
1. GitHub에서 새 커밋 푸시
2. Vercel에서 자동 배포 대기
3. 실패 시 Redeploy 버튼 클릭

### 방법 3: 새 Vercel 프로젝트 생성
1. 기존 프로젝트 삭제
2. GitHub 리포지토리 다시 연결
3. 올바른 설정으로 새 프로젝트 생성

## 📞 다음 단계
1. Vercel 대시보드에서 Root Directory 설정 확인
2. 설정 수정 후 Redeploy 시도
3. 여전히 실패 시 에러 로그 확인
