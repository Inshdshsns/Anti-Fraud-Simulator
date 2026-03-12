@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Anti-Fraud Simulator - Installer
echo ============================================
echo.

:: Check for Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo Node.js found:
node --version
echo.

:: Change to script directory
cd /d "%~dp0"
echo [2/4] Installing dependencies...
echo.

:: Install dependencies
call npm install --prefer-offline
if %errorlevel% neq 0 (
    echo.
    echo Trying mirror registry...
    call npm install --registry https://registry.npmmirror.com
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)
echo.
echo Dependencies installed!
echo.

:: Start dev server
echo [3/4] Starting server...
echo.
echo Server is starting...
echo.

:: Run in background and open browser
start "" cmd /c "npm run dev"

:: Wait for server to start (5 seconds)
echo [4/4] Waiting for server to start...
timeout /t 5 /nobreak >nul

:: Open browser
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ============================================
echo   Server is running!
echo   URL: http://localhost:5173
echo.
echo   To stop the server, close the terminal window
echo ============================================
echo.
pause
