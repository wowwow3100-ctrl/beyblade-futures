@echo off
title Beyblade Deploy

:: Auto switch to the folder where this bat file is located
cd /d "%~dp0"

echo.
echo  ====================================
echo   Beyblade - Auto Deploy
echo  ====================================
echo.

echo  [1/4] npm install...
call npm install
if errorlevel 1 (
    echo  [ERROR] npm install failed
    pause
    exit /b 1
)

echo.
echo  [2/4] git add...
git add .

echo.
echo  [3/4] git commit...
git commit -m "update"

echo.
echo  [4/4] git push...
git push
if errorlevel 1 (
    echo  [ERROR] git push failed
    pause
    exit /b 1
)

echo.
echo  ====================================
echo   Done! Vercel will update in ~1 min
echo   https://beyblade-futures.vercel.app
echo  ====================================
echo.
pause
