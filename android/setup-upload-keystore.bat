:: MatchaMD — Android upload keystore setup
:: Run from: C:\Users\paulf\matchamd\android

setlocal

:: TODO: Replace the placeholders below before running.
set STORE_PASSWORD=REPLACE_STORE_PASSWORD
set KEY_PASSWORD=REPLACE_KEY_PASSWORD
set KEYSTORE_PATH=%~dp0upload-keystore.jks
set KEY_ALIAS=EmberWingIndustriesLLC
set DNAME=CN=MatchaMD, OU=Emberwing Industries LLC, O=Emberwing Industries LLC, L=City, S=State, C=US

where keytool >nul
if errorlevel 1 (
  echo ERROR: keytool not found. Use a Command Prompt / Git Bash launched from Android Studio.
  exit /b 1
)

echo Generating upload keystore at %KEYSTORE_PATH%
keytool -genkey -v -noprompt -keystore "%KEYSTORE_PATH%" -keyalg RSA -keysize 2048 -validity 10000 -alias "%KEY_ALIAS%" -dname "%DNAME%" -storepass "%STORE_PASSWORD%" -keypass "%KEY_PASSWORD%"

echo Generating upload certificate PEM...
keytool -export -rfc -keystore "%KEYSTORE_PATH%" -alias "%KEY_ALIAS%" -storepass "%STORE_PASSWORD%" -file "%~dp0upload-keystore.pem" -keypass "%KEY_PASSWORD%"

echo Writing local.properties...
if exist "%~dp0local.properties" (
  copy /y "%~dp0local.properties" "%~dp0local.properties.bak" >nul
  echo Backed up existing local.properties to local.properties.bak
)

(
  echo release.storeFile=upload-keystore.jks
  echo release.keyAlias=EmberWingIndustriesLLC
  echo release.storePassword=%STORE_PASSWORD%
  echo release.keyPassword=%KEY_PASSWORD%
) > "%~dp0local.properties"

echo Done. Keystore generated and local.properties configured.
pause
