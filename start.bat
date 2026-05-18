@echo off
title USDT/MYR Exchange App
echo Starting USDT/MYR Exchange App...
echo.

REM Start backend
start "Backend (Port 3001)" cmd /k "cd /d %~dp0backend && node server.js"

REM Wait 3 seconds then start frontend
timeout /t 3 /nobreak >nul
start "Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting...
echo Backend : http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
