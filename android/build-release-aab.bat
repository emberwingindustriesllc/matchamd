@echo off
:: MatchaMD release build preparation
:: This script assumes release signing config is already in place.

setlocal

 cd /d "%~dp0"
echo Syncing web assets to Android...
call npm run cap:build:android

echo Building release AAB...
call gradlew.bat :app:bundleRelease

if exist app\build\outputs\bundle\release\app-release.aab (
  echo SUCCESS: AAB built at app\build\outputs\bundle\release\app-release.aab
) else (
  echo FAILED: release AAB not found
)
pause
