@echo off
echo =================================================
echo      LEGAL DOCUMENT ANALYZER - MOBILE SETUP
echo =================================================
echo.

echo Step 1: Installing dependencies...
cd frontend\public
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Starting the app for mobile access...
echo.
echo =================================================
echo           MOBILE ACCESS INSTRUCTIONS
echo =================================================
echo.
echo 1. Make sure your phone and computer are on the same WiFi network
echo.
echo 2. On your phone's browser, go to one of these addresses:
echo    - http://localhost:19009 (if testing on computer)
echo    - http://192.168.1.100:19009 (replace with your computer's IP)
echo    - http://10.0.0.100:19009 (alternative IP format)
echo.
echo 3. For best experience, tap "Add to Home Screen" in your browser
echo    to install as a PWA (Progressive Web App)
echo.
echo 4. The app will have real camera access and AI analysis!
echo.
echo =================================================
echo Starting the development server...
echo =================================================

call npm run web-dev

pause
