# OBDOC MVP 통합 테스트 실행 스크립트 (PowerShell)
# 사용법: .\scripts\run-integration-tests.ps1 [environment]

param(
    [string]$Environment = "staging",
    [string]$BaseUrl = "http://localhost:3000"
)

# 색상 함수
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 환경 변수 설정
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ReportDir = ".\test-reports\$Timestamp"

Write-Info "Starting integration tests for environment: $Environment"
Write-Info "Base URL: $BaseUrl"
Write-Info "Report directory: $ReportDir"

# 리포트 디렉토리 생성
New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null

# 사전 검사
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Node.js 확인
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed"
        exit 1
    }
    
    # npm 확인
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed"
        exit 1
    }
    
    # Playwright 확인
    try {
        npx playwright --version | Out-Null
    }
    catch {
        Write-Error "Playwright is not installed"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# 의존성 설치
function Install-Dependencies {
    Write-Info "Installing dependencies..."
    npm ci
    npx playwright install --with-deps
    Write-Success "Dependencies installed"
}

# 서비스 헬스 체크
function Test-Health {
    Write-Info "Performing health check..."
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Success "Health check passed"
                return $true
            }
        }
        catch {
            Write-Info "Health check attempt $attempt/$maxAttempts failed, retrying in 10 seconds..."
            Start-Sleep -Seconds 10
            $attempt++
        }
    }
    
    Write-Error "Health check failed after $maxAttempts attempts"
    return $false
}

# 유닛 테스트 실행
function Invoke-UnitTests {
    Write-Info "Running unit tests..."
    
    try {
        npm run test:coverage -- --outputFile="$ReportDir\unit-test-results.json" --json
        Write-Success "Unit tests passed"
        return $true
    }
    catch {
        Write-Error "Unit tests failed"
        return $false
    }
}

# 통합 테스트 실행
function Invoke-IntegrationTests {
    Write-Info "Running integration tests..."
    
    try {
        npx playwright test integration.spec.ts --reporter=html --output-dir="$ReportDir\integration"
        Write-Success "Integration tests passed"
        return $true
    }
    catch {
        Write-Error "Integration tests failed"
        return $false
    }
}

# 보안 감사 테스트 실행
function Invoke-SecurityTests {
    Write-Info "Running security audit tests..."
    
    try {
        npx playwright test security-audit.spec.ts --reporter=html --output-dir="$ReportDir\security"
        Write-Success "Security tests passed"
        return $true
    }
    catch {
        Write-Error "Security tests failed"
        return $false
    }
}

# 성능 테스트 실행
function Invoke-PerformanceTests {
    Write-Info "Running performance tests..."
    
    try {
        npx playwright test performance.spec.ts --reporter=html --output-dir="$ReportDir\performance"
        Write-Success "Performance tests passed"
        return $true
    }
    catch {
        Write-Error "Performance tests failed"
        return $false
    }
}

# 접근성 테스트 실행
function Invoke-AccessibilityTests {
    Write-Info "Running accessibility tests..."
    
    try {
        npx playwright test accessibility.spec.ts --reporter=html --output-dir="$ReportDir\accessibility"
        Write-Success "Accessibility tests passed"
        return $true
    }
    catch {
        Write-Error "Accessibility tests failed"
        return $false
    }
}

# Lighthouse 성능 감사
function Invoke-LighthouseAudit {
    Write-Info "Running Lighthouse performance audit..."
    
    if (Get-Command lhci -ErrorAction SilentlyContinue) {
        try {
            lhci autorun --upload.target=filesystem --upload.outputDir="$ReportDir\lighthouse"
            Write-Success "Lighthouse audit completed"
            return $true
        }
        catch {
            Write-Warning "Lighthouse audit failed"
            return $false
        }
    }
    else {
        Write-Warning "Lighthouse CI not installed, skipping performance audit"
        return $true
    }
}

# 보안 스캔
function Invoke-SecurityScan {
    Write-Info "Running security scan..."
    
    # npm audit
    try {
        npm audit --audit-level moderate --json | Out-File -FilePath "$ReportDir\npm-audit.json"
        Write-Success "npm audit completed"
    }
    catch {
        Write-Warning "npm audit found vulnerabilities"
    }
    
    # Snyk 스캔 (토큰이 있는 경우)
    if ($env:SNYK_TOKEN -and (Get-Command snyk -ErrorAction SilentlyContinue)) {
        try {
            snyk test --json | Out-File -FilePath "$ReportDir\snyk-results.json"
            Write-Success "Snyk security scan completed"
        }
        catch {
            Write-Warning "Snyk scan found vulnerabilities"
        }
    }
    else {
        Write-Info "Snyk token not found or Snyk not installed, skipping Snyk scan"
    }
}

# 테스트 결과 요약
function New-TestSummary {
    Write-Info "Generating test summary..."
    
    $summaryFile = "$ReportDir\test-summary.md"
    $currentDate = Get-Date
    
    $summaryContent = @"
# OBDOC MVP 통합 테스트 결과

## 테스트 실행 정보
- **실행 시간**: $currentDate
- **환경**: $Environment
- **Base URL**: $BaseUrl
- **리포트 디렉토리**: $ReportDir

## 테스트 결과 요약

### ✅ 통과한 테스트
"@

    if (Test-Path "$ReportDir\unit-test-results.json") {
        $summaryContent += "`n- 유닛 테스트"
    }
    
    if (Test-Path "$ReportDir\integration") {
        $summaryContent += "`n- 통합 테스트"
    }
    
    if (Test-Path "$ReportDir\security") {
        $summaryContent += "`n- 보안 감사 테스트"
    }
    
    if (Test-Path "$ReportDir\performance") {
        $summaryContent += "`n- 성능 테스트"
    }
    
    if (Test-Path "$ReportDir\accessibility") {
        $summaryContent += "`n- 접근성 테스트"
    }
    
    $summaryContent += @"

### 📊 상세 리포트
- [통합 테스트 리포트](./integration/index.html)
- [보안 감사 리포트](./security/index.html)
- [성능 테스트 리포트](./performance/index.html)
- [접근성 테스트 리포트](./accessibility/index.html)
- [Lighthouse 리포트](./lighthouse/index.html)

### 🔍 보안 스캔 결과
- [npm audit 결과](./npm-audit.json)
- [Snyk 스캔 결과](./snyk-results.json)

## 권장사항

### 즉시 수정 필요
- 보안 테스트에서 발견된 고위험 취약점
- 성능 테스트에서 임계값을 초과한 항목
- 접근성 테스트에서 발견된 WCAG 위반 사항

### 개선 권장
- 성능 최적화 기회
- 사용자 경험 개선 사항
- 코드 품질 향상 방안

---
**테스트 완료 시간**: $currentDate
"@

    $summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-Success "Test summary generated: $summaryFile"
}

# 정리 작업
function Invoke-Cleanup {
    Write-Info "Cleaning up..."
    
    # 임시 파일 정리
    Get-ChildItem -Path . -Filter "*.tmp" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
    
    # 오래된 리포트 정리 (30일 이상)
    $cutoffDate = (Get-Date).AddDays(-30)
    Get-ChildItem -Path ".\test-reports" -Directory | Where-Object { $_.CreationTime -lt $cutoffDate } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Success "Cleanup completed"
}

# 메인 실행 함수
function Main {
    Write-Info "OBDOC MVP Integration Test Suite"
    Write-Info "Environment: $Environment"
    Write-Info "Timestamp: $Timestamp"
    
    $exitCode = 0
    
    # 사전 검사
    Test-Prerequisites
    
    # 의존성 설치
    Install-Dependencies
    
    # 헬스 체크
    if (-not (Test-Health)) {
        Write-Error "Service is not healthy, aborting tests"
        exit 1
    }
    
    # 테스트 실행
    Write-Info "Starting test execution..."
    
    # 유닛 테스트
    if (-not (Invoke-UnitTests)) {
        $exitCode = 1
    }
    
    # 통합 테스트
    if (-not (Invoke-IntegrationTests)) {
        $exitCode = 1
    }
    
    # 보안 테스트
    if (-not (Invoke-SecurityTests)) {
        $exitCode = 1
    }
    
    # 성능 테스트
    if (-not (Invoke-PerformanceTests)) {
        $exitCode = 1
    }
    
    # 접근성 테스트
    if (-not (Invoke-AccessibilityTests)) {
        $exitCode = 1
    }
    
    # Lighthouse 감사
    Invoke-LighthouseAudit | Out-Null
    
    # 보안 스캔
    Invoke-SecurityScan
    
    # 결과 요약
    New-TestSummary
    
    # 정리 작업
    Invoke-Cleanup
    
    if ($exitCode -eq 0) {
        Write-Success "All tests completed successfully!"
        Write-Info "Test reports available at: $ReportDir"
    }
    else {
        Write-Error "Some tests failed. Check the reports for details."
        Write-Info "Test reports available at: $ReportDir"
    }
    
    exit $exitCode
}

# 스크립트 실행
Main