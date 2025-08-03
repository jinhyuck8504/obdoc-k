# OBDOC MVP 프로덕션 런칭 스크립트
# PowerShell 스크립트

Write-Host "🚀 OBDOC MVP 프로덕션 런칭을 시작합니다..." -ForegroundColor Green

# 1. 환경 확인
Write-Host "`n📋 1단계: 환경 확인" -ForegroundColor Yellow
Write-Host "Node.js 버전 확인..."
node --version
Write-Host "npm 버전 확인..."
npm --version

# 2. 의존성 설치
Write-Host "`n📦 2단계: 의존성 설치" -ForegroundColor Yellow
npm ci

# 3. 린트 및 타입 체크
Write-Host "`n🔍 3단계: 코드 품질 검사" -ForegroundColor Yellow
Write-Host "ESLint 검사 중..."
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint 검사 실패!" -ForegroundColor Red
    exit 1
}

Write-Host "TypeScript 타입 체크 중..."
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript 타입 체크 실패!" -ForegroundColor Red
    exit 1
}

# 4. 테스트 실행
Write-Host "`n🧪 4단계: 테스트 실행" -ForegroundColor Yellow
Write-Host "유닛 테스트 실행 중..."
npm run test -- --coverage --watchAll=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 유닛 테스트 실패!" -ForegroundColor Red
    exit 1
}

# 5. 빌드
Write-Host "`n🏗️ 5단계: 프로덕션 빌드" -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패!" -ForegroundColor Red
    exit 1
}

# 6. 보안 감사
Write-Host "`n🛡️ 6단계: 보안 감사" -ForegroundColor Yellow
Write-Host "npm 보안 감사 중..."
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ 보안 취약점이 발견되었습니다. 확인 후 진행하세요." -ForegroundColor Yellow
}

# 7. 성능 테스트 (선택사항)
Write-Host "`n⚡ 7단계: 성능 테스트" -ForegroundColor Yellow
Write-Host "Lighthouse 테스트는 배포 후 실행하세요."

# 8. Git 상태 확인
Write-Host "`n📝 8단계: Git 상태 확인" -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ 커밋되지 않은 변경사항이 있습니다:" -ForegroundColor Yellow
    git status --short
    $response = Read-Host "계속 진행하시겠습니까? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "런칭이 취소되었습니다." -ForegroundColor Red
        exit 1
    }
}

# 9. 배포 준비 완료
Write-Host "`n✅ 프로덕션 런칭 준비 완료!" -ForegroundColor Green
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. GitHub에 코드 푸시: git push origin main" -ForegroundColor White
Write-Host "2. Netlify에서 자동 배포 확인" -ForegroundColor White
Write-Host "3. 배포 후 기능 테스트 실행" -ForegroundColor White
Write-Host "4. 모니터링 시스템 확인" -ForegroundColor White

# 10. 배포 실행 여부 확인
$deployResponse = Read-Host "`n지금 GitHub에 푸시하여 배포를 시작하시겠습니까? (y/N)"
if ($deployResponse -eq "y" -or $deployResponse -eq "Y") {
    Write-Host "`n🚀 배포를 시작합니다..." -ForegroundColor Green
    
    # 현재 브랜치 확인
    $currentBranch = git branch --show-current
    Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Cyan
    
    if ($currentBranch -ne "main") {
        Write-Host "⚠️ main 브랜치가 아닙니다. main 브랜치로 전환하시겠습니까? (y/N)" -ForegroundColor Yellow
        $switchResponse = Read-Host
        if ($switchResponse -eq "y" -or $switchResponse -eq "Y") {
            git checkout main
            git pull origin main
        } else {
            Write-Host "배포가 취소되었습니다." -ForegroundColor Red
            exit 1
        }
    }
    
    # Git 푸시
    Write-Host "GitHub에 푸시 중..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 배포가 시작되었습니다!" -ForegroundColor Green
        Write-Host "Netlify 대시보드에서 배포 진행 상황을 확인하세요." -ForegroundColor Cyan
        Write-Host "배포 완료 후 https://obdoc-mvp.netlify.app 에서 확인 가능합니다." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Git 푸시 실패!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n수동으로 배포하려면 다음 명령어를 실행하세요:" -ForegroundColor Cyan
    Write-Host "git push origin main" -ForegroundColor White
}

Write-Host "`n🏥💙 OBDOC MVP 런칭 스크립트 완료!" -ForegroundColor Green