@echo off
echo ========================================
echo   Menjacnica The Best - Rate Updater
echo ========================================
echo.

REM Proveri da li je Node.js instaliran
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ GREŠKA: Node.js nije instaliran!
    echo 📥 Molimo instalirajte Node.js sa https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js je instaliran
echo.

REM Instaliraj dependencies ako nisu instalirani
if not exist "node_modules" (
    echo 📦 Instaliranje dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ GREŠKA: Neuspešna instalacija packages!
        pause
        exit /b 1
    )
    echo ✅ Dependencies instalirani
    echo.
)

echo 🚀 Pokretanje automatic rate updater...
echo ⏰ Automatsko ažuriranje: 8:00 i 12:00 svaki dan
echo 🛑 Za zaustavljanje pritisnite Ctrl+C
echo.

REM Pokreni cron scheduler
node cron-scheduler.js

pause