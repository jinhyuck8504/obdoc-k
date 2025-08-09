# GitHub obdoc-k 리포지토리 업로드 파일 목록

## 업로드할 파일들

### 1. package.json (루트에 업로드)
- 현재 위치: 워크스페이스 루트의 `package.json`
- GitHub 위치: `obdoc-k` 리포지토리 루트

### 2. .github/workflows/deploy-vercel.yml (업데이트된 버전)
- 현재 위치: `obdoc-mvp/.github/workflows/deploy-vercel.yml`
- GitHub 위치: `obdoc-k/.github/workflows/deploy-vercel.yml`

## 중요 변경사항

1. **npm ci → npm install 변경**
   - `npm ci`는 `package-lock.json`이 정확히 일치해야 하지만
   - `npm install`은 `package.json`을 기반으로 새로운 `package-lock.json`을 생성합니다

2. **package-lock.json 제거**
   - 잘못된 형식의 파일을 제거했습니다
   - GitHub Actions에서 `npm install` 실행 시 자동으로 올바른 파일이 생성됩니다

## 업로드 순서

1. `package.json`을 GitHub 루트에 업로드
2. `.github/workflows/deploy-vercel.yml`을 GitHub에 업로드
3. GitHub Actions가 자동으로 실행되어 `package-lock.json` 생성

## 예상 결과

- GitHub Actions에서 캐시 오류 없이 정상 실행
- 첫 번째 빌드에서 올바른 `package-lock.json` 자동 생성
- 이후 빌드에서는 캐시 활용으로 빠른 실행

## 추가 필요한 파일들 (선택사항)

만약 전체 프로젝트를 GitHub에 올리려면:
- `src/` 폴더 전체
- `database/` 폴더
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js` (있다면)
- 기타 설정 파일들

하지만 현재는 GitHub Actions 오류 해결을 위해 위의 2개 파일만 업로드하면 됩니다.
