# Gemma 4 Python Service Startup Script
# This script activates venv and starts the Flask server

Write-Host "🚀 Starting Gemma 4 Python AI Service..." -ForegroundColor Cyan
Write-Host ""

# Check if venv exists
if (-not (Test-Path "venv\Scripts\activate.ps1")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run the following commands first:" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  venv\Scripts\activate" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please review settings if needed." -ForegroundColor Green
    Write-Host ""
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\activate.ps1"

# Check if Flask is installed
$flaskInstalled = pip list 2>$null | Select-String "flask"
if (-not $flaskInstalled) {
    Write-Host "❌ Flask not installed in virtual environment!" -ForegroundColor Red
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Start Flask server
Write-Host "🌐 Starting Flask server on port 5000..." -ForegroundColor Green
Write-Host ""
python app.py
