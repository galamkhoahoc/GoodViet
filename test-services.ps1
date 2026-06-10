# Test GoodViet Services
Write-Host "Testing GoodViet Services..." -ForegroundColor Cyan
Write-Host ""

# Test Python AI Service
Write-Host "1. Python AI Service (Port 5000):" -ForegroundColor Yellow
try {
    $pythonHealth = curl.exe -s http://localhost:5000/health | ConvertFrom-Json
    Write-Host "   Status: OK" -ForegroundColor Green
    Write-Host "   Model: $($pythonHealth.model)" -ForegroundColor White
    Write-Host "   Device: $($pythonHealth.device)" -ForegroundColor White
    
    if ($pythonHealth.device -eq "cpu") {
        Write-Host "   WARNING: Using CPU (VERY SLOW)" -ForegroundColor Red
        Write-Host ""
        Write-Host "   SOLUTION: Switch to Gemini for fast response" -ForegroundColor Yellow
        Write-Host "   - Edit: backend\.env" -ForegroundColor White
        Write-Host "   - Change: AI_SERVICE=gemini" -ForegroundColor White
        Write-Host "   - Restart Node.js backend" -ForegroundColor White
    }
} catch {
    Write-Host "   Status: OFFLINE" -ForegroundColor Red
}

Write-Host ""

# Test Node.js Backend
Write-Host "2. Node.js Backend (Port 3000):" -ForegroundColor Yellow
try {
    $backendHealth = curl.exe -s http://localhost:3000/health | ConvertFrom-Json
    Write-Host "   Status: OK" -ForegroundColor Green
    Write-Host "   Environment: $($backendHealth.environment)" -ForegroundColor White
} catch {
    Write-Host "   Status: OFFLINE" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
