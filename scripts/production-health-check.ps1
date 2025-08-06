# OBDOC MVP 프로덕션 상태 확인 스크립트
# PowerShell에서 실행: .\scripts\production-health-check.ps1

Write-Host "🔍 OBDOC MVP 프로덕션 상태 확인..." -ForegroundColor Green

$baseUrl = "https://obdoc-mvp.netlify.app"
$endpoints = @(
    @{ Path = "/"; Name = "홈페이지" },
    @{ Path = "/login"; Name = "로그인 페이지" },
    @{ Path = "/signup"; Name = "회원가입 페이지" },
    @{ Path = "/api/health"; Name = "헬스체크 API" }
)

$results = @()

foreach ($endpoint in $endpoints) {
    $url = $baseUrl + $endpoint.Path
    Write-Host "📡 $($endpoint.Name) 확인 중... ($url)" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        $status = if ($response.StatusCode -eq 200) { "✅ 정상" } else { "⚠️ 응답코드: $($response.StatusCode)" }
        $loadTime = $response.Headers.'X-Response-Time'
        
        $results += [PSCustomObject]@{
            Endpoint = $endpoint.Name
            URL = $url
            Status = $status
            StatusCode = $response.StatusCode
            LoadTime = if ($loadTime) { $loadTime } else { "측정불가" }
        }
        
        Write-Host "   $status" -ForegroundColor Green
    }
    catch {
        $results += [PSCustomObject]@{
            Endpoint = $endpoint.Name
            URL = $url
            Status = "❌ 실패"
            StatusCode = "Error"
            LoadTime = "N/A"
            Error = $_.Exception.Message
        }
        
        Write-Host "   ❌ 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

# 결과 요약
Write-Host "`n📊 상태 확인 결과:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

# 전체 상태 평가
$successCount = ($results | Where-Object { $_.StatusCode -eq 200 }).Count
$totalCount = $results.Count
$successRate = [math]::Round(($successCount / $totalCount) * 100, 1)

Write-Host "`n📈 전체 상태: $successCount/$totalCount 성공 ($successRate%)" -ForegroundColor Cyan

if ($successRate -ge 80) {
    Write-Host "🎉 서비스가 정상적으로 운영 중입니다!" -ForegroundColor Green
} elseif ($successRate -ge 50) {
    Write-Host "⚠️ 일부 기능에 문제가 있을 수 있습니다." -ForegroundColor Yellow
} else {
    Write-Host "🚨 서비스에 심각한 문제가 있습니다!" -ForegroundColor Red
}

# 추가 확인사항
Write-Host "`n🔧 추가 확인사항:" -ForegroundColor Cyan
Write-Host "• Netlify 대시보드: https://app.netlify.com/sites/obdoc-mvp" -ForegroundColor White
Write-Host "• Supabase 대시보드: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "• 관리자 페이지: $baseUrl/dashboard/admin" -ForegroundColor White

Write-Host "`n✅ 상태 확인 완료!" -ForegroundColor Green
