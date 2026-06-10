# Script tự động cài đặt và cấu hình Ollama với Gemma

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  GOODVIET - Ollama Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is installed
Write-Host "🔍 Checking Ollama installation..." -ForegroundColor Yellow
$ollamaInstalled = $false

try {
    $version = ollama --version 2>$null
    if ($version) {
        Write-Host "✅ Ollama is installed: $version" -ForegroundColor Green
        $ollamaInstalled = $true
    }
} catch {
    Write-Host "❌ Ollama is not installed" -ForegroundColor Red
}

# If not installed, prompt to install
if (-not $ollamaInstalled) {
    Write-Host ""
    Write-Host "Ollama chưa được cài đặt." -ForegroundColor Yellow
    Write-Host "Hãy làm theo các bước sau:" -ForegroundColor Yellow
    Write-Host "1. Truy cập: https://ollama.com/download/windows" -ForegroundColor White
    Write-Host "2. Tải và cài đặt OllamaSetup.exe" -ForegroundColor White
    Write-Host "3. Chạy lại script này sau khi cài đặt" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "Bạn có muốn mở trình duyệt để tải Ollama? (y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
        Start-Process "https://ollama.com/download/windows"
    }
    
    exit
}

# Check if Ollama service is running
Write-Host ""
Write-Host "🔍 Checking Ollama service..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    Write-Host "✅ Ollama service is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Ollama service is not running" -ForegroundColor Yellow
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# Check installed models
Write-Host ""
Write-Host "🔍 Checking installed models..." -ForegroundColor Yellow

$models = ollama list 2>$null
Write-Host $models

$hasGemma2b = $models -match "gemma:2b"
$hasGemma7b = $models -match "gemma:7b"

if (-not $hasGemma2b -and -not $hasGemma7b) {
    Write-Host ""
    Write-Host "❌ Gemma model chưa được cài đặt" -ForegroundColor Red
    Write-Host ""
    Write-Host "Chọn model để tải:" -ForegroundColor Yellow
    Write-Host "1. gemma:2b (1.4GB, nhanh, khuyến nghị)" -ForegroundColor White
    Write-Host "2. gemma:7b (4.8GB, chất lượng cao)" -ForegroundColor White
    Write-Host "3. Cả hai" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Nhập lựa chọn (1/2/3)"
    
    if ($choice -eq "1" -or $choice -eq "3") {
        Write-Host ""
        Write-Host "📥 Đang tải gemma:2b (1.4GB)..." -ForegroundColor Yellow
        Write-Host "Quá trình này có thể mất 5-15 phút tùy vào tốc độ mạng..." -ForegroundColor Yellow
        ollama pull gemma:2b
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ gemma:2b đã được tải thành công!" -ForegroundColor Green
        } else {
            Write-Host "❌ Lỗi khi tải gemma:2b" -ForegroundColor Red
        }
    }
    
    if ($choice -eq "2" -or $choice -eq "3") {
        Write-Host ""
        Write-Host "📥 Đang tải gemma:7b (4.8GB)..." -ForegroundColor Yellow
        Write-Host "Quá trình này có thể mất 15-30 phút tùy vào tốc độ mạng..." -ForegroundColor Yellow
        ollama pull gemma:7b
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ gemma:7b đã được tải thành công!" -ForegroundColor Green
        } else {
            Write-Host "❌ Lỗi khi tải gemma:7b" -ForegroundColor Red
        }
    }
} else {
    if ($hasGemma2b) {
        Write-Host "✅ gemma:2b đã được cài đặt" -ForegroundColor Green
    }
    if ($hasGemma7b) {
        Write-Host "✅ gemma:7b đã được cài đặt" -ForegroundColor Green
    }
}

# Test the model
Write-Host ""
Write-Host "🧪 Testing Gemma model..." -ForegroundColor Yellow

$testModel = if ($hasGemma2b) { "gemma:2b" } else { "gemma:7b" }

Write-Host "Sending test message to $testModel..." -ForegroundColor White
$testResponse = ollama run $testModel "Xin chào" --verbose 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Model test successful!" -ForegroundColor Green
    Write-Host "Response preview:" -ForegroundColor White
    Write-Host $testResponse -ForegroundColor Gray
} else {
    Write-Host "❌ Model test failed" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Ollama: Installed" -ForegroundColor Green
Write-Host "✅ Service: Running" -ForegroundColor Green

if ($hasGemma2b -or $hasGemma7b) {
    Write-Host "✅ Model: Ready" -ForegroundColor Green
} else {
    Write-Host "⚠️ Model: Not installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Chạy backend: npm run dev" -ForegroundColor White
Write-Host "2. Backend sẽ tự động dùng Ollama" -ForegroundColor White
Write-Host "3. Test chat qua frontend hoặc API" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "- Model lần đầu chạy sẽ chậm (load vào RAM)" -ForegroundColor White
Write-Host "- Sau đó sẽ nhanh hơn (~2-5 giây/response)" -ForegroundColor White
Write-Host "- Để chuyển về Gemini API, đổi AI_SERVICE=gemini trong .env" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
