@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ===================================================
echo   Starting DriveLine Car Dealership Application
echo ===================================================

echo [1/2] Starting Backend API on http://localhost:4000...
start "DriveLine - Backend API" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%~dp0backend" && npm run dev"

echo [2/2] Starting Frontend UI on http://localhost:5173...
start "DriveLine - Frontend UI" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%~dp0frontend" && npm run dev"

echo Waiting for servers to initialize...
timeout /t 3 >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo Both servers are running in separate terminal windows.
echo To stop them, simply close the respective command prompt windows.
echo ===================================================
