@echo off
echo Starting HR Training Application...
echo.

REM Start Backend
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo Both servers are starting in separate windows...
