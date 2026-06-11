@echo off
echo ================================================
echo   CHECKING BACKEND STATUS
echo ================================================
echo.
echo Opening backend URL in browser...
echo.
start https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/
echo.
echo ================================================
echo What do you see in browser?
echo ================================================
echo.
echo A) {"message":"GoodViet API is running",...}
echo    ^-^> Backend is OK!
echo.
echo B) "The deployment could not be found"
echo    ^-^> Backend project does NOT exist on Vercel
echo    ^-^> You need to CREATE backend project
echo.
echo C) Error page or blank page
echo    ^-^> Backend deployment FAILED
echo    ^-^> Check Vercel logs
echo.
echo D) Other JSON error
echo    ^-^> Backend running but has errors
echo    ^-^> Check environment variables
echo.
pause
