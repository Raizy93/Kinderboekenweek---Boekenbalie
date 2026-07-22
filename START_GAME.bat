@echo off
title De Boekenbalie
cd /d "%~dp0"

echo De Boekenbalie wordt klaargemaakt...

if not exist "node_modules\" (
  echo Benodigde onderdelen worden eenmalig geinstalleerd.
  call "C:\Program Files\nodejs\npm.cmd" install
  if errorlevel 1 goto :error
)

call "C:\Program Files\nodejs\npm.cmd" run build
if errorlevel 1 goto :error

"C:\Program Files\nodejs\node.exe" server.mjs
exit /b 0

:error
echo.
echo Het starten is niet gelukt. Controleer of Node.js is geinstalleerd.
pause
exit /b 1
