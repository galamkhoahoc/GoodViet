# Quick Deploy Script for Vercel
# This script helps you deploy GoodViet to Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   GoodViet - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "Vercel CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check environment variables
Write-Host "1. Checking environment variables..." -ForegroundColor Yellow
$envFile = "backend\.env"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    # Check AI_SERVICE
    if ($envContent -match 'AI_SERVICE=gemini') {
        Write-Host "   [OK] AI_SERVICE=gemini" -ForegroundColor Green
    } else {
        Write-Host "   [WARNING] AI_SERVICE should be 'gemini' for Vercel" -ForegroundColor Red
        Write-Host "   Current value in .env might not work on Vercel" -ForegroundColor Yellow
    }
    
    # Check GEMINI_API_KEY
    if ($envContent -match 'GEMINI_API_KEY=') {
        Write-Host "   [OK] GEMINI_API_KEY is set" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] GEMINI_API_KEY not found" -ForegroundColor Red
    }
    
    # Check MONGODB_URI
    if ($envContent -match 'MONGODB_URI=') {
        Write-Host "   [OK] MONGODB_URI is set" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] MONGODB_URI not found" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERROR] .env file not found in backend/" -ForegroundColor Red
}

Write-Host ""

# Check vercel.json
Write-Host "2. Checking Vercel configuration..." -ForegroundColor Yellow
if (Test-Path "backend\vercel.json") {
    Write-Host "   [OK] vercel.json exists" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] vercel.json not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ready to deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd backend" -ForegroundColor White
Write-Host "2. vercel login" -ForegroundColor White
Write-Host "3. vercel" -ForegroundColor White
Write-Host "4. vercel --prod (for production)" -ForegroundColor White
Write-Host ""
Write-Host "Or follow the full guide in VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
