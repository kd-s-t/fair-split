#!/usr/bin/env bash
# fix-caddy-https.sh — Write a Caddyfile for both hosts and (re)load Caddy
# Usage:
#   sudo bash scripts/fix-caddy-https.sh <ROOT_DOMAIN> [APP_DOMAIN]
# Example:
#   sudo bash scripts/fix-caddy-https.sh thesplitsafe.com app.thesplitsafe.com

set -euo pipefail

ROOT_DOMAIN=${1:-}
APP_DOMAIN=${2:-}

if [[ -z "$ROOT_DOMAIN" ]]; then
  echo "Usage: sudo bash $0 <ROOT_DOMAIN> [APP_DOMAIN]"
  exit 1
fi

if [[ -z "$APP_DOMAIN" ]]; then
  APP_DOMAIN="app.${ROOT_DOMAIN}"
fi

echo "🔧 Configuring Caddy for:"
echo "  - ROOT_DOMAIN: ${ROOT_DOMAIN}"
echo "  - APP_DOMAIN : ${APP_DOMAIN}"

# Ensure prerequisites and Caddy are installed (Ubuntu/Debian)
if ! command -v caddy >/dev/null 2>&1; then
  echo "📦 Installing Caddy..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl gnupg lsb-release >/dev/null
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy >/dev/null
fi

mkdir -p /etc/caddy
cat >/etc/caddy/Caddyfile <<CADDY
${ROOT_DOMAIN} {
  encode zstd gzip
  reverse_proxy 127.0.0.1:4943
}
${APP_DOMAIN} {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
CADDY

echo "✅ Caddyfile written to /etc/caddy/Caddyfile"

echo "🔍 Validating Caddyfile..."
caddy validate --config /etc/caddy/Caddyfile

echo "🚀 Enabling and reloading Caddy..."
systemctl enable --now caddy >/dev/null 2>&1 || true
systemctl reload caddy || systemctl restart caddy

echo "⏳ Waiting for HTTPS to come up (max ~90s for cert issuance)..."
for host in "$ROOT_DOMAIN" "$APP_DOMAIN"; do
  for i in {1..18}; do
    if curl -sI "https://${host}" | head -n 1 | grep -Eq " 200| 301| 302"; then
      echo "✅ ${host} is responding over HTTPS"
      break
    fi
    sleep 5
    [[ $i -eq 18 ]] && echo "⚠️  ${host} not ready yet; check 'journalctl -u caddy'" || true
  done
done

echo "✨ Done. If you still see 404/SSL errors, run: journalctl -u caddy -n 100 --no-pager"


