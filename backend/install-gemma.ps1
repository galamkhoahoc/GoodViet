Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  GOODVIET - Ollama Gemma Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📥 Bước 1: Kiểm tra Ollama..." -ForegroundColor Yellow
ollama --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi: Ollama chưa được cài đặt đúng" -ForegroundColor Red
    Write-Host "Hãy đóng terminal này và mở PowerShell mới" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Ollama đã cài đặt thành công!" -ForegroundColor Green
Write-Host ""

Write-Host "📥 Bước 2: Kiểm tra model hiện có..." -ForegroundColor Yellow
ollama list

Write-Host ""
Write-Host "📥 Bước 3: Tải model Gemma 2B (1.4GB)..." -ForegroundColor Yellow
Write-Host "⏱️  Quá trình này mất 5-15 phút tùy vào tốc độ mạng." -ForegroundColor Gray
Write-Host "💡 Bạn có thể để chạy và làm việc khác..." -ForegroundColor Gray
Write-Host ""

ollama pull gemma:2b

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Model Gemma 2B đã được tải thành công!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 Danh sách model:" -ForegroundColor Yellow
    ollama list
    
    Write-Host ""
    Write-Host "🧪 Test model với câu 'Xin chao'..." -ForegroundColor Yellow
    ollama run gemma:2b "Xin chao"
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  ✨ Setup hoàn tất!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Bước tiếp theo:" -ForegroundColor Yellow
    Write-Host "1. Quay lại Kiro" -ForegroundColor White
    Write-Host "2. Gõ 'xong' để tôi khởi động backend" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Lỗi khi tải model" -ForegroundColor Red
    Write-Host "Hãy thử lại bằng lệnh: ollama pull gemma:2b" -ForegroundColor Yellow
}

Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
