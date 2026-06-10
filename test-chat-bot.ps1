# Script Test Chat Bot Quality
# Kiểm tra chất lượng và tốc độ response của chat bot

Write-Host "🤖 Test Chat Bot GoodViet" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Test 1: Check which provider is being used
Write-Host "📊 Test 1: Kiểm tra AI provider đang dùng..." -ForegroundColor Yellow
Write-Host ""

$backendLogs = Get-Content "backend\logs\*.log" -Tail 50 -ErrorAction SilentlyContinue
if ($backendLogs) {
    $providerLine = $backendLogs | Select-String "AI Service: Using" | Select-Object -Last 1
    if ($providerLine) {
        Write-Host "✅ Provider: $providerLine" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Không tìm thấy log file. Kiểm tra terminal output." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Test 2: Test response time and quality
Write-Host "🧪 Test 2: Test thời gian response..." -ForegroundColor Yellow
Write-Host ""

# You need a valid auth token for this test
Write-Host "⚠️  Để test chat endpoint, bạn cần:" -ForegroundColor Yellow
Write-Host "   1. Đăng nhập vào ứng dụng" -ForegroundColor White
Write-Host "   2. Lấy JWT token từ LocalStorage" -ForegroundColor White
Write-Host "   3. Chạy lệnh test với token:" -ForegroundColor White
Write-Host ""
Write-Host '   $token = "your-jwt-token-here"' -ForegroundColor Cyan
Write-Host '   $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}' -ForegroundColor Cyan
Write-Host '   $body = @{content = "Làm sao để phân biệt âm L và N?"} | ConvertTo-Json' -ForegroundColor Cyan
Write-Host '   Measure-Command {' -ForegroundColor Cyan
Write-Host '     $response = Invoke-RestMethod -Uri "http://localhost:3000/api/chat/messages" -Method POST -Headers $headers -Body $body' -ForegroundColor Cyan
Write-Host '     Write-Host "Response: $($response.botMessage.content)"' -ForegroundColor Cyan
Write-Host '   }' -ForegroundColor Cyan

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Test 3: Check service health
Write-Host "💚 Test 3: Health check các services..." -ForegroundColor Yellow
Write-Host ""

try {
    $pythonHealth = curl.exe -s http://localhost:5000/health | ConvertFrom-Json
    Write-Host "✅ Python AI Service: OK" -ForegroundColor Green
    Write-Host "   - Model: $($pythonHealth.model)" -ForegroundColor White
    Write-Host "   - Device: $($pythonHealth.device)" -ForegroundColor White
    
    if ($pythonHealth.device -eq "cpu") {
        Write-Host "   ⚠️  WARNING: Đang dùng CPU (rất chậm!)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Python AI Service: OFFLINE" -ForegroundColor Red
}

Write-Host ""

try {
    $backendHealth = curl.exe -s http://localhost:3000/health | ConvertFrom-Json
    Write-Host "✅ Node.js Backend: OK" -ForegroundColor Green
    Write-Host "   - Status: $($backendHealth.status)" -ForegroundColor White
    Write-Host "   - Environment: $($backendHealth.environment)" -ForegroundColor White
} catch {
    Write-Host "❌ Node.js Backend: OFFLINE" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Recommendations
Write-Host "💡 Khuyến nghị:" -ForegroundColor Cyan
Write-Host ""

if ($pythonHealth.device -eq "cpu") {
    Write-Host "⚠️  Python service đang dùng CPU → Response sẽ chậm (8-12 giây)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 Giải pháp nhanh: Chuyển sang Gemini" -ForegroundColor Green
    Write-Host "   1. Mở file: backend\.env" -ForegroundColor White
    Write-Host "   2. Đổi: AI_SERVICE=gemini" -ForegroundColor White
    Write-Host "   3. Restart Node.js backend" -ForegroundColor White
    Write-Host ""
    Write-Host "📈 Giải pháp lâu dài: Cài CUDA (nếu có GPU NVIDIA)" -ForegroundColor Green
    Write-Host "   → Xem hướng dẫn trong HƯỚNG_DẪN_CẢI_THIỆN_CHAT_BOT.md" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Test hoàn tất!" -ForegroundColor Green
Write-Host ""
