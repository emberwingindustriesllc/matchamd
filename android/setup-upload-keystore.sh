#!/usr/bin/env bash
set -euo pipefail

read -rsp "Enter upload keystore password (min 6 chars): " STORE_PASSWORD
echo

read -rsp "Re-enter password: " STORE_PASSWORD2
echo
if [ "$STORE_PASSWORD" != "$STORE_PASSWORD2" ]; then
  echo "Passwords do not match."
  exit 1
fi

if [ ${#STORE_PASSWORD} -lt 6 ]; then
  echo "Keystore password must be at least 6 characters."
  exit 1
fi

read -rsp "Enter key password for EmberWingIndustriesLLC (press Enter to reuse keystore password): " KEY_PASSWORD
echo
KEY_PASSWORD=${KEY_PASSWORD:-$STORE_PASSWORD}

read -rsp "Re-enter key password: " KEY_PASSWORD2
echo
if [ "$STORE_PASSWORD" != "$STORE_PASSWORD2" ] && [ "$KEY_PASSWORD" != "$KEY_PASSWORD2" ]; then
  echo "Key password confirmation did not match."
  exit 1
fi

set -a
source "$(dirname "$0")/local.properties.env"
set +a

LOCAL_PROPS="$(dirname "$0")/local.properties"
cp "$LOCAL_PROPS" "$LOCAL_PROPS.bak" 2>/dev/null || true

{
  echo "RELEASE_STORE_FILE=upload-keystore.jks"
  echo "RELEASE_KEY_ALIAS=EmberWingIndustriesLLC"
  printf 'RELEASE_STORE_PASSWORD=%s\n' "$STORE_PASSWORD"
  printf 'RELEASE_KEY_PASSWORD=%s\n' "$KEY_PASSWORD"
} > "$LOCAL_PROPS"

echo "Saved $LOCAL_PROPS from $LOCAL_PROPS.bak if present."

keytool -genkey -v \
  -keystore "$(dirname "$0")/upload-keystore.jks" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias EmberWingIndustriesLLC \
  -storepass "$STORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=EmberWing Industries LLC, OU=MatchaMD, O=EmberWing Industries LLC, L=, S=, C=US"

echo
echo "Keystore created at $(dirname "$0")/upload-keystore.jks"
echo "Keep this file backed up. Do not commit it to git."
