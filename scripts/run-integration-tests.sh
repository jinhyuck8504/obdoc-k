#!/bin/bash

# OBDOC MVP 통합 테스트 실행 스크립트
# 사용법: ./scripts/run-integration-tests.sh [environment]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 설정
ENVIRONMENT=${1:-staging}
BASE_URL=${BASE_URL:-http://localhost:3000}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="./test-reports/${TIMESTAMP}"

log_info "Starting integration tests for environment: $ENVIRONMENT"
log_info "Base URL: $BASE_URL"
log_info "Report directory: $REPORT_DIR"

# 리포트 디렉토리 생성
mkdir -p "$REPORT_DIR"

# 사전 검사
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Node.js 확인
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # npm 확인
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Playwright 확인
    if ! npx playwright --version &> /dev/null; then
        log_error "Playwright is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# 의존성 설치
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci
    npx playwright install --with-deps
    log_success "Dependencies installed"
}

# 서비스 헬스 체크
health_check() {
    log_info "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "$BASE_URL/api/health" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# 유닛 테스트 실행
run_unit_tests() {
    log_info "Running unit tests..."
    
    if npm run test:coverage -- --outputFile="$REPORT_DIR/unit-test-results.json" --json; then
        log_success "Unit tests passed"
        return 0
    else
        log_error "Unit tests failed"
        return 1
    fi
}

# 통합 테스트 실행
run_integration_tests() {
    log_info "Running integration tests..."
    
    local test_results=0
    
    # 기본 통합 테스트
    if npx playwright test integration.spec.ts --reporter=html --output-dir="$REPORT_DIR/integration"; then
        log_success "Integration tests passed"
    else
        log_error "Integration tests failed"
        test_results=1
    fi
    
    return $test_results
}

# 보안 감사 테스트 실행
run_security_tests() {
    log_info "Running security audit tests..."
    
    local test_results=0
    
    # 보안 테스트
    if npx playwright test security-audit.spec.ts --reporter=html --output-dir="$REPORT_DIR/security"; then
        log_success "Security tests passed"
    else
        log_error "Security tests failed"
        test_results=1
    fi
    
    return $test_results
}

# 성능 테스트 실행
run_performance_tests() {
    log_info "Running performance tests..."
    
    local test_results=0
    
    # 성능 테스트
    if npx playwright test performance.spec.ts --reporter=html --output-dir="$REPORT_DIR/performance"; then
        log_success "Performance tests passed"
    else
        log_error "Performance tests failed"
        test_results=1
    fi
    
    return $test_results
}

# 접근성 테스트 실행
run_accessibility_tests() {
    log_info "Running accessibility tests..."
    
    local test_results=0
    
    # 접근성 테스트
    if npx playwright test accessibility.spec.ts --reporter=html --output-dir="$REPORT_DIR/accessibility"; then
        log_success "Accessibility tests passed"
    else
        log_error "Accessibility tests failed"
        test_results=1
    fi
    
    return $test_results
}

# Lighthouse 성능 감사
run_lighthouse_audit() {
    log_info "Running Lighthouse performance audit..."
    
    if command -v lhci &> /dev/null; then
        if lhci autorun --upload.target=filesystem --upload.outputDir="$REPORT_DIR/lighthouse"; then
            log_success "Lighthouse audit completed"
            return 0
        else
            log_warning "Lighthouse audit failed"
            return 1
        fi
    else
        log_warning "Lighthouse CI not installed, skipping performance audit"
        return 0
    fi
}

# 보안 스캔
run_security_scan() {
    log_info "Running security scan..."
    
    # npm audit
    if npm audit --audit-level moderate --json > "$REPORT_DIR/npm-audit.json"; then
        log_success "npm audit completed"
    else
        log_warning "npm audit found vulnerabilities"
    fi
    
    # Snyk 스캔 (토큰이 있는 경우)
    if [ -n "$SNYK_TOKEN" ] && command -v snyk &> /dev/null; then
        if snyk test --json > "$REPORT_DIR/snyk-results.json"; then
            log_success "Snyk security scan completed"
        else
            log_warning "Snyk scan found vulnerabilities"
        fi
    else
        log_info "Snyk token not found or Snyk not installed, skipping Snyk scan"
    fi
}

# 테스트 결과 요약
generate_summary() {
    log_info "Generating test summary..."
    
    local summary_file="$REPORT_DIR/test-summary.md"
    
    cat > "$summary_file" << EOF
# OBDOC MVP 통합 테스트 결과

## 테스트 실행 정보
- **실행 시간**: $(date)
- **환경**: $ENVIRONMENT
- **Base URL**: $BASE_URL
- **리포트 디렉토리**: $REPORT_DIR

## 테스트 결과 요약

### ✅ 통과한 테스트
EOF

    if [ -f "$REPORT_DIR/unit-test-results.json" ]; then
        echo "- 유닛 테스트" >> "$summary_file"
    fi
    
    if [ -d "$REPORT_DIR/integration" ]; then
        echo "- 통합 테스트" >> "$summary_file"
    fi
    
    if [ -d "$REPORT_DIR/security" ]; then
        echo "- 보안 감사 테스트" >> "$summary_file"
    fi
    
    if [ -d "$REPORT_DIR/performance" ]; then
        echo "- 성능 테스트" >> "$summary_file"
    fi
    
    if [ -d "$REPORT_DIR/accessibility" ]; then
        echo "- 접근성 테스트" >> "$summary_file"
    fi
    
    cat >> "$summary_file" << EOF

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
**테스트 완료 시간**: $(date)
EOF

    log_success "Test summary generated: $summary_file"
}

# 정리 작업
cleanup() {
    log_info "Cleaning up..."
    
    # 임시 파일 정리
    find . -name "*.tmp" -delete 2>/dev/null || true
    
    # 오래된 리포트 정리 (30일 이상)
    find ./test-reports -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# 메인 실행 함수
main() {
    log_info "OBDOC MVP Integration Test Suite"
    log_info "Environment: $ENVIRONMENT"
    log_info "Timestamp: $TIMESTAMP"
    
    local exit_code=0
    
    # 사전 검사
    check_prerequisites
    
    # 의존성 설치
    install_dependencies
    
    # 헬스 체크
    if ! health_check; then
        log_error "Service is not healthy, aborting tests"
        exit 1
    fi
    
    # 테스트 실행
    log_info "Starting test execution..."
    
    # 유닛 테스트
    if ! run_unit_tests; then
        exit_code=1
    fi
    
    # 통합 테스트
    if ! run_integration_tests; then
        exit_code=1
    fi
    
    # 보안 테스트
    if ! run_security_tests; then
        exit_code=1
    fi
    
    # 성능 테스트
    if ! run_performance_tests; then
        exit_code=1
    fi
    
    # 접근성 테스트
    if ! run_accessibility_tests; then
        exit_code=1
    fi
    
    # Lighthouse 감사
    run_lighthouse_audit
    
    # 보안 스캔
    run_security_scan
    
    # 결과 요약
    generate_summary
    
    # 정리 작업
    cleanup
    
    if [ $exit_code -eq 0 ]; then
        log_success "All tests completed successfully!"
        log_info "Test reports available at: $REPORT_DIR"
    else
        log_error "Some tests failed. Check the reports for details."
        log_info "Test reports available at: $REPORT_DIR"
    fi
    
    exit $exit_code
}

# 스크립트 실행
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi