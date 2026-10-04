@echo off
title Stoic Body — Sovereign Desktop Hub
color 0C

:MENU
cls
echo ========================================================================
echo                 STOIC BODY -- SOVEREIGN DESKTOP HUB
echo ========================================================================
echo.
echo   [1] Launch Desktop App (Production Window - Cloud)
echo   [2] Start Local Dev & Customizer (http://localhost:3000)
echo   [3] Pull Latest Updates from GitHub (origin/main)
echo   [4] Build & Deploy Latest Code to Vercel Production
echo   [5] Run Full Automated Test Suite & Audit
echo   [6] Open Project Directory in File Explorer
echo   [7] Open Project in VS Code / IDE
echo   [0] Exit
echo.
echo ========================================================================
set /p choice="Enter option [0-7]: "

if "%choice%"=="1" goto LAUNCH_APP
if "%choice%"=="2" goto LOCAL_DEV
if "%choice%"=="3" goto GIT_PULL
if "%choice%"=="4" goto DEPLOY_VERCEL
if "%choice%"=="5" goto RUN_TESTS
if "%choice%"=="6" goto OPEN_DIR
if "%choice%"=="7" goto OPEN_IDE
if "%choice%"=="0" exit
goto MENU

:LAUNCH_APP
cls
echo Launching Stoic Body Standalone Window...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=https://stoic-body.vercel.app --user-data-dir="C:\Users\stoic\.stoic-body\app-profile"
) else (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=https://stoic-body.vercel.app --user-data-dir="C:\Users\stoic\.stoic-body\app-profile"
)
goto MENU

:LOCAL_DEV
cls
echo Starting Next.js Local Dev Server on http://localhost:3000...
echo Once loaded, the standalone app window will launch. Press Ctrl+C in this window to stop server.
echo.
cd /d "C:\Users\stoic\AntigravityWorkspace\projects\stoic-body"
start "" cmd /c "timeout /t 3 >nul && start \"\" \"C:\Program Files\Google\Chrome\Application\chrome.exe\" --app=http://localhost:3000"
npm run dev
goto MENU

:GIT_PULL
cls
echo Pulling latest commits from GitHub...
cd /d "C:\Users\stoic\AntigravityWorkspace\projects\stoic-body"
git pull origin main
echo.
pause
goto MENU

:DEPLOY_VERCEL
cls
echo Deploying current code to Vercel production...
cd /d "C:\Users\stoic\AntigravityWorkspace\projects\stoic-body"
call npm test
if %errorlevel% neq 0 (
    echo [ERROR] Tests failed! Aborting deployment.
    pause
    goto MENU
)
call vercel --prod --yes
echo.
pause
goto MENU

:RUN_TESTS
cls
echo Running test suites...
cd /d "C:\Users\stoic\AntigravityWorkspace\projects\stoic-body"
call npm test
echo.
echo Running comprehensive Playwright route audit...
call node tests/audit-verification.mjs
echo.
pause
goto MENU

:OPEN_DIR
explorer "C:\Users\stoic\AntigravityWorkspace\projects\stoic-body"
goto MENU

:OPEN_IDE
cd /d "C:\Users\stoic\AntigravityWorkspace\projects\stoic-body"
code .
goto MENU
