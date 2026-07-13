#!/usr/bin/env bash
# Deploys Solarplan (API + web) on a resource-constrained machine without Docker.
# Run this from the repo root on the target machine.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$REPO_ROOT/.env"
WEB_DIST="$REPO_ROOT/apps/web/dist"
API_DIR="$REPO_ROOT/apps/api"
PID_FILE="$REPO_ROOT/.api.pid"
LOG_FILE="$REPO_ROOT/api.log"
NGINX_SITE="/etc/nginx/conf.d/solarplan.conf"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
die() { printf '\033[1;31mError: %s\033[0m\n' "$1" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Ensure required tools exist
# ---------------------------------------------------------------------------
command -v node >/dev/null 2>&1 || die "node is not installed"
command -v pnpm >/dev/null 2>&1 || die "pnpm is not installed"

if ! command -v nginx >/dev/null 2>&1; then
  log "nginx not found, installing"
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y nginx
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nginx
  elif command -v apk >/dev/null 2>&1; then
    sudo apk add --no-cache nginx
  else
    die "no supported package manager found to install nginx; install it manually"
  fi
fi

# ---------------------------------------------------------------------------
# 2. Load .env, prompt only for required vars that are missing/empty
# ---------------------------------------------------------------------------
if [ ! -f "$ENV_FILE" ]; then
  log "No .env found at $ENV_FILE, creating one"
  touch "$ENV_FILE"
fi
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

prompt_and_persist() {
  local var_name="$1"
  local prompt_text="$2"
  local current_value="${!var_name:-}"

  if [ -n "$current_value" ]; then
    return
  fi

  read -r -p "$prompt_text: " value
  [ -n "$value" ] || die "$var_name is required"

  export "$var_name=$value"

  if grep -q "^${var_name}=" "$ENV_FILE" 2>/dev/null; then
    sed -i.bak "s#^${var_name}=.*#${var_name}=${value}#" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  else
    printf '%s=%s\n' "$var_name" "$value" >> "$ENV_FILE"
  fi
}

log "Checking required environment variables"
prompt_and_persist DATABASE_URL "Postgres connection string (DATABASE_URL)"
prompt_and_persist SOLARPLAN_API_URL "Public API URL (e.g. http://your-host:1337/api)"
prompt_and_persist SOLARPLAN_CLIENT_URL "Public web URL (e.g. http://your-host)"

if [ -z "${AUTH_SECRET:-}" ]; then
  log "AUTH_SECRET not set, generating one"
  AUTH_SECRET="$(openssl rand -hex 32)"
  export AUTH_SECRET
  if grep -q "^AUTH_SECRET=" "$ENV_FILE" 2>/dev/null; then
    sed -i.bak "s#^AUTH_SECRET=.*#AUTH_SECRET=${AUTH_SECRET}#" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  else
    printf 'AUTH_SECRET=%s\n' "$AUTH_SECRET" >> "$ENV_FILE"
  fi
fi

PORT="${PORT:-1337}"

# ---------------------------------------------------------------------------
# 3. Install dependencies and build (workspace packages -> api -> web)
# ---------------------------------------------------------------------------
log "Installing dependencies"
cd "$REPO_ROOT"
pnpm install --frozen-lockfile

log "Building workspace packages"
pnpm --filter @solarplan/email build
pnpm --filter @solarplan/permissions build

log "Building API"
pnpm --filter @solarplan/api build

log "Building web"
pnpm --filter @solarplan/web build

# ---------------------------------------------------------------------------
# 4. Substitute runtime URL placeholders into the web build
# ---------------------------------------------------------------------------
log "Substituting SOLARPLAN_API_URL / SOLARPLAN_CLIENT_URL into web/dist"
find "$WEB_DIST" -type f -name "*.js" -exec grep -l "SOLARPLAN_API_URL" {} \; | \
  xargs -r sed -i "s#SOLARPLAN_API_URL#$SOLARPLAN_API_URL#g"
find "$WEB_DIST" -type f -name "*.js" -exec grep -l "SOLARPLAN_CLIENT_URL" {} \; | \
  xargs -r sed -i "s#SOLARPLAN_CLIENT_URL#$SOLARPLAN_CLIENT_URL#g"

# ---------------------------------------------------------------------------
# 5. Configure nginx to serve the web build and proxy /api to the API
# ---------------------------------------------------------------------------
log "Writing nginx site config"
sudo tee "$NGINX_SITE" >/dev/null <<EOF
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:${PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        root ${WEB_DIST};
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo nginx -t
sudo systemctl reload nginx 2>/dev/null || sudo nginx -s reload 2>/dev/null || sudo service nginx reload

# ---------------------------------------------------------------------------
# 6. (Re)start the API in the background
# ---------------------------------------------------------------------------
log "Stopping any previous API process"
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  kill "$(cat "$PID_FILE")"
  sleep 1
fi

log "Starting API on port ${PORT}"
cd "$API_DIR"
PORT="$PORT" nohup node --enable-source-maps dist/index.js >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
cd "$REPO_ROOT"

sleep 2
if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  log "API is running (pid $(cat "$PID_FILE")), logs at $LOG_FILE"
else
  die "API failed to start — check $LOG_FILE"
fi

log "Done. Web served by nginx on port 80, API on port ${PORT} (proxied at /api/)."
