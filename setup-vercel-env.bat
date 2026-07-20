@echo off
echo ================================================
echo   SETUP VERCEL ENVIRONMENT VARIABLES
echo ================================================
echo.
echo This script will help you set environment variables using Vercel CLI
echo.
echo Prerequisites:
echo 1. Vercel CLI installed (npm install -g vercel)
echo 2. Logged in to Vercel (vercel login)
echo.
pause

echo.
echo ================================================
echo   BACKEND ENVIRONMENT VARIABLES
echo ================================================
echo.
echo Setting environment variables for backend project...
echo.

cd backend

vercel env add MONGODB_URI production
echo mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE?retryWrites=true^&w=majority

vercel env add JWT_SECRET production
echo replace-with-at-least-32-random-characters

vercel env add GEMINI_API_KEY production
echo your-gemini-api-key

vercel env add AI_SERVICE production
echo gemini

vercel env add CORS_ORIGIN production
echo *

vercel env add NODE_ENV production
echo production

vercel env add PORT production
echo 3000

echo.
echo ================================================
echo   DONE!
echo ================================================
echo.
echo Environment variables have been set.
echo Now redeploy your backend project on Vercel Dashboard.
echo.
pause
