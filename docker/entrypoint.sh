#!/bin/bash
set -e

# Render injects $PORT (default 10000). Substitute into nginx config.
export PORT=${PORT:-10000}
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
echo "==> Generated Nginx Config:"
cat /etc/nginx/conf.d/default.conf

echo "==> Starting LeadMind (nginx on :$PORT, backend on :8000, frontend on :3000)"
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
