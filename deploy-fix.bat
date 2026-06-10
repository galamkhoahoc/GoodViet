@echo off
echo ================================================
echo   FIX VERCEL BUILD - COMMIT AND PUSH
echo ================================================
echo.

echo [1/3] Adding files to git...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "Fix: Change default build command to vite build for Vercel"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ================================================
echo   DONE! Vercel will auto-deploy in 1-2 minutes
echo ================================================
echo.
echo Next steps:
echo 1. Go to Vercel Dashboard
echo 2. Check Deployments tab
echo 3. Wait for build to complete
echo 4. Your app will be at: https://glkh-good-viet-vu2r.vercel.app
echo.
pause
