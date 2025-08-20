@echo off
echo 🚀 Starting Demo Backend for Legal Awareness App
echo ============================================
echo.
echo This will start a demo backend server on port 8000
echo The frontend will be able to connect and show demo legal analysis
echo.
echo Press Ctrl+C to stop the server when done
echo.
echo Starting server...
echo.

cd frontend\public
node demo-backend.js

pause
