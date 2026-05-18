@echo off
title USDT/MYR Exchange App
echo ================================================
echo   USDT/MYR Exchange App
echo ================================================
echo.

REM Allow ports through Windows Firewall (runs silently)
netsh advfirewall firewall add rule name="USDT Exchange Backend" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1
netsh advfirewall firewall add rule name="USDT Exchange Frontend" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

REM Start backend
start "Backend (Port 3001)" cmd /k "cd /d %~dp0backend && node server.js"

REM Wait 3 seconds then start frontend
timeout /t 3 /nobreak >nul
start "Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  PC Browser:    http://localhost:3000
echo  Phone Browser: http://%LOCAL_IP%:3000
echo.
echo  Make sure your phone is on the same WiFi!
echo ================================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
