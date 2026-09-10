@echo off
title Fingerprint Blood Group Detection Launcher
cd /d "%~dp0"
echo ========================================================
echo   Fingerprint-Based Blood Group Detection System
echo ========================================================
echo.
echo Select an option to test images:
echo  [1] Launch Interactive Web App (Streamlit in Browser)
echo  [2] Launch Desktop GUI App (Window file picker)
echo  [3] Run Quick Command-Line Test on Sample Image
echo  [4] Exit
echo.
set /p choice="Enter your choice (1/2/3/4): "

set PYTHON_EXE=F:\Be+\venv_tf\Scripts\python.exe

if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=..\venv_tf\Scripts\python.exe
)

if "%choice%"=="1" (
    echo Starting Streamlit Web App...
    "%PYTHON_EXE%" -m streamlit run app.py
) else if "%choice%"=="2" (
    echo Starting Desktop GUI App...
    "%PYTHON_EXE%" gui_app.py
) else if "%choice%"=="3" (
    "%PYTHON_EXE%" predict.py
    pause
) else (
    exit
)
