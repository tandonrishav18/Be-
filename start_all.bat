@echo off
title BE+ Blood Group Detection - System Launcher
cd /d "%~dp0"
echo ========================================================
echo   BE+ Fingerprint-Based Blood Group AI System
echo ========================================================
echo.
echo Starting ML Model Backend Server (Port 5000)...
start "BE+ ML Backend" cmd /k "venv_tf\Scripts\python.exe fingerprint-based-blood-group-detection\server.py"

echo Starting BE+ Frontend Website (Port 3000)...
cd /d "%~dp0\BE+ FRONTEND"
start "BE+ Frontend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul
echo Opening application in browser...
start http://localhost:3000

echo.
echo ========================================================
echo   System is Ready!
echo   Frontend: http://localhost:3000
echo   ML Backend: http://localhost:5000
echo ========================================================
