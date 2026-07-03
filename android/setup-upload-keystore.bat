:: MatchaMD — Android upload keystore setup
:: Run from: C:\Users\paulf\matchamd\android

setlocal

:: TODO: Replace the placeholders below before running.
set STORE_PASSWORD=REPLACE_STORE_PASSWORD
set KEY_PASSWORD=REPLACE_KEY_PASSWORD
set KEYSTORE_PATH=%~dp0upload-keystore.jks
set KEY_ALIAS=upload
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

echo Done.
echo Next: confirm you want me to wire these values into android/build.gradle/local.properties for release signing.
pause
