# OBDOC MVP 런칭 후 검증 스크립트
# PowerShell 스크립트

param(
    [string]$BaseUrl = "https://obdoc-mvp.netlify.app"
)

Write-Host "🔍 OBDOC MVP 런칭 후 검증을 시작합니다..." -ForegroundColor Green
Write-Host "대상 URL: $BaseUrl" -ForegroundColor Cyan

$ErrorCount = 0
$SuccessCount = 0

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$ExpectedStatus = 200
    )
    
    try {
        Write-Host "테스트 중: $Description" -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Description - 성공 (상태코드: $($response.StatusCode))" -ForegroundColor Green
            $script:SuccessCount++
            return $true
        } else {
            Write-Host "❌ $Description - 실패 (예상: $ExpectedStatus, 실제: $($response.StatusCode))" -ForegroundColor Red
            $script:ErrorCount++
            return $false
        }
    }
    catch {
        Write-Host "❌ $Description - 오류: $($_.Exception.Message)" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

function Test-PageContent {
    param(
        [string]$Url,
        [string]$Description,
        [string]$ExpectedContent
    )
    
    try {
        Write-Host "콘텐츠 테스트: $Description" -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30 -UseBasicParsing
        
        if ($response.Content -like "*$ExpectedContent*") {
            Write-Host "✅ $Description - 콘텐츠 확인됨" -ForegroundColor Green
            $script:SuccessCount++
            return $true
        } else {
            Write-Host "❌ $Description - 예상 콘텐츠를 찾을 수 없음" -ForegroundColor Red
            $script:ErrorCount++
            return $false
        }
    }
    catch {
        Write-Host "❌ $Description - 오류: $($_.Exception.Message)" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

# 1. 기본 페이지 접근성 테스트
Write-Host "`n📋 1단계: 기본 페이지 접근성 테스트" -ForegroundColor Cyan

Test-Endpoint "$BaseUrl" "홈페이지"
Test-Endpoint "$BaseUrl/login" "로그인 페이지"
Test-Endpoint "$BaseUrl/signup" "회원가입 페이지"
Test-Endpoint "$BaseUrl/terms" "이용약관 페이지"
Test-Endpoint "$BaseUrl/privacy" "개인정보처리방침 페이지"
Test-Endpoint "$BaseUrl/contact" "고객지원 페이지"

# 2. API 엔드포인트 테스트
Write-Host "`n🔌 2단계: API 엔드포인트 테스트" -ForegroundColor Cyan

Test-Endpoint "$BaseUrl/api/health" "헬스 체크 API"

# 3. 정적 자산 테스트
Write-Host "`n🖼️ 3단계: 정적 자산 테스트" -ForegroundColor Cyan

Test-Endpoint "$BaseUrl/favicon.ico" "파비콘"
Test-Endpoint "$BaseUrl/robots.txt" "robots.txt"

# 4. 콘텐츠 검증
Write-Host "`n📝 4단계: 페이지 콘텐츠 검증" -ForegroundColor Cyan

Test-PageContent "$BaseUrl" "홈페이지 제목" "OBDOC"
Test-PageContent "$BaseUrl/login" "로그인 페이지" "로그인"
Test-PageContent "$BaseUrl/signup" "회원가입 페이지" "회원가입"

# 5. HTTPS 및 보안 헤더 확인
Write-Host "`n🛡️ 5단계: 보안 설정 확인" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method GET -TimeoutSec 30
    
    # HTTPS 확인
    if ($BaseUrl.StartsWith("https://")) {
        Write-Host "✅ HTTPS 사용 중" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "❌ HTTPS 미사용" -ForegroundColor Red
        $ErrorCount++
    }
    
    # 보안 헤더 확인
    $securityHeaders = @{
        "X-Frame-Options" = "X-Frame-Options 헤더"
        "X-Content-Type-Options" = "X-Content-Type-Options 헤더"
        "Strict-Transport-Security" = "HSTS 헤더"
    }
    
    foreach ($header in $securityHeaders.Keys) {
        if ($response.Headers[$header]) {
            Write-Host "✅ $($securityHeaders[$header]) 설정됨" -ForegroundColor Green
            $SuccessCount++
        } else {
            Write-Host "⚠️ $($securityHeaders[$header]) 누락" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "❌ 보안 헤더 확인 실패: $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 6. 성능 기본 확인
Write-Host "`n⚡ 6단계: 기본 성능 확인" -ForegroundColor Cyan

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method GET -TimeoutSec 30 -UseBasicParsing
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 3000) {
        Write-Host "✅ 응답 시간: ${responseTime}ms (3초 이내)" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "⚠️ 응답 시간: ${responseTime}ms (3초 초과)" -ForegroundColor Yellow
    }
}
catch {
    $stopwatch.Stop()
    Write-Host "❌ 성능 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 7. 모바일 접근성 기본 확인
Write-Host "`n📱 7단계: 모바일 접근성 기본 확인" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method GET -TimeoutSec 30 -UseBasicParsing
    
    if ($response.Content -like "*viewport*") {
        Write-Host "✅ 뷰포트 메타 태그 확인됨" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "❌ 뷰포트 메타 태그 누락" -ForegroundColor Red
        $ErrorCount++
    }
}
catch {
    Write-Host "❌ 모바일 접근성 확인 실패: $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 8. E2E 테스트 실행 (선택사항)
Write-Host "`n🎭 8단계: E2E 테스트 (선택사항)" -ForegroundColor Cyan
$e2eResponse = Read-Host "E2E 테스트를 실행하시겠습니까? (y/N)"

if ($e2eResponse -eq "y" -or $e2eResponse -eq "Y") {
    Write-Host "E2E 테스트 실행 중..." -ForegroundColor Yellow
    
    # 환경 변수 설정
    $env:BASE_URL = $BaseUrl
    
    try {
        npm run test:e2e
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ E2E 테스트 통과" -ForegroundColor Green
            $SuccessCount++
        } else {
            Write-Host "❌ E2E 테스트 실패" -ForegroundColor Red
            $ErrorCount++
        }
    }
    catch {
        Write-Host "❌ E2E 테스트 실행 오류: $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# 결과 요약
Write-Host "`n📊 검증 결과 요약" -ForegroundColor Cyan
Write-Host "성공: $SuccessCount" -ForegroundColor Green
Write-Host "실패: $ErrorCount" -ForegroundColor Red

$totalTests = $SuccessCount + $ErrorCount
if ($totalTests -gt 0) {
    $successRate = [math]::Round(($SuccessCount / $totalTests) * 100, 2)
    Write-Host "성공률: $successRate%" -ForegroundColor Cyan
}

if ($ErrorCount -eq 0) {
    Write-Host "`n🎉 모든 검증이 성공적으로 완료되었습니다!" -ForegroundColor Green
    Write-Host "OBDOC MVP가 성공적으로 런칭되었습니다! 🚀" -ForegroundColor Green
} elseif ($ErrorCount -le 2) {
    Write-Host "`n⚠️ 일부 검증에서 문제가 발견되었지만 서비스는 정상 작동합니다." -ForegroundColor Yellow
    Write-Host "발견된 문제들을 검토하고 필요시 수정하세요." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ 여러 검증에서 문제가 발견되었습니다." -ForegroundColor Red
    Write-Host "서비스 상태를 점검하고 문제를 해결한 후 다시 검증하세요." -ForegroundColor Red
}

# 추가 권장사항
Write-Host "`n📋 추가 권장사항:" -ForegroundColor Cyan
Write-Host "1. Google Analytics 설정 확인" -ForegroundColor White
Write-Host "2. Sentry 에러 모니터링 확인" -ForegroundColor White
Write-Host "3. Lighthouse 성능 테스트 실행" -ForegroundColor White
Write-Host "4. 실제 사용자 테스트 진행" -ForegroundColor White
Write-Host "5. 백업 시스템 동작 확인" -ForegroundColor White

Write-Host "`n🏥💙 OBDOC MVP 검증 완료!" -ForegroundColor Green