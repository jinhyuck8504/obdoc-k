# OBDOC MVP 프로덕션 배포 스크립트
# PowerShell에서 실행: .\scripts\deploy-production.ps1

Write-Host "🚀 OBDOC MVP 프로덕션 배포 시작..." -ForegroundColor Green

# 1. 환경 확인
Write-Host "📋 환경 확인 중..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git이 설치되지 않았습니다." -ForegroundColor Red
    exit 1
}

# 2. 의존성 설치
Write-Host "📦 의존성 설치 중..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 의존성 설치 실패" -ForegroundColor Red
    exit 1
}

# 3. TypeScript 타입 체크
Write-Host "🔍 TypeScript 타입 체크..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript 타입 에러 발견" -ForegroundColor Red
    exit 1
}

# 4. ESLint 검사
Write-Host "🔍 코드 품질 검사..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ ESLint 경고가 있지만 계속 진행합니다." -ForegroundColor Yellow
}

# 5. 프로덕션 빌드
Write-Host "🏗️ 프로덕션 빌드..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패" -ForegroundColor Red
    exit 1
}

# 6. Git 상태 확인
Write-Host "📝 Git 상태 확인..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 변경사항을 커밋합니다..." -ForegroundColor Yellow
    git add .
    $commitMessage = "🚀 Production deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
}

# 7. GitHub에 푸시
Write-Host "🚀 GitHub에 배포..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub 푸시 실패" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 배포 완료!" -ForegroundColor Green
Write-Host "🌐 서비스 URL: https://obdoc-mvp.netlify.app" -ForegroundColor Cyan
Write-Host "⏱️ Netlify에서 빌드 완료까지 약 3-5분 소요됩니다." -ForegroundColor Yellow
Write-Host "📊 배포 상태 확인: https://app.netlify.com/sites/obdoc-mvp/deploys" -ForegroundColor Cyan

# 8. 배포 후 자동 검증 (선택사항)
$response = Read-Host "배포 완료 후 자동 검증을 실행하시겠습니까? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "⏳ 배포 완료 대기 중... (60초)" -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    Write-Host "🔍 서비스 상태 확인 중..." -ForegroundColor Yellow
    try {
        $healthCheck = Invoke-WebRequest -Uri "https://obdoc-mvp.netlify.app" -TimeoutSec 10
        if ($healthCheck.StatusCode -eq 200) {
            Write-Host "✅ 서비스가 정상적으로 실행 중입니다!" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️ 서비스 상태 확인 실패. 수동으로 확인해주세요." -ForegroundColor Yellow
    }
}

Write-Host "🎉 OBDOC MVP 프로덕션 배포가 완료되었습니다!" -ForegroundColor Green
