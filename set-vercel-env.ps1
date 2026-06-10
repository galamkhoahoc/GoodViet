# Set Vercel Environment Variables
# Run this in the backend directory

Write-Host "Setting Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
cd backend

# Set environment variables
Write-Host "Adding MONGODB_URI..." -ForegroundColor Yellow
vercel env add MONGODB_URI production

Write-Host "Adding JWT_SECRET..." -ForegroundColor Yellow
vercel env add JWT_SECRET production

Write-Host "Adding GEMINI_API_KEY..." -ForegroundColor Yellow
vercel env add GEMINI_API_KEY production

Write-Host "Adding AI_SERVICE..." -ForegroundColor Yellow
vercel env add AI_SERVICE production

Write-Host "Adding CORS_ORIGIN..." -ForegroundColor Yellow
vercel env add CORS_ORIGIN production

Write-Host "Adding NODE_ENV..." -ForegroundColor Yellow
vercel env add NODE_ENV production

Write-Host ""
Write-Host "Environment variables added!" -ForegroundColor Green
Write-Host "Now redeploying..." -ForegroundColor Yellow
Write-Host ""

# Redeploy
vercel --prod

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
