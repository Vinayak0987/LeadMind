# ══════════════════════════════════════════════════════════════════════════════
# LeadMind — Monolithic Docker Image
# Runs FastAPI (backend) + Next.js (frontend) + nginx (reverse proxy)
# in a single container, managed by supervisord.
#
# nginx routes:
#   /api/*    → FastAPI on :8000
#   /public/* → FastAPI static files on :8000
#   /*        → Next.js on :3000
# ══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Build Next.js ────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

# Since nginx handles routing on the same domain, API calls are relative (/api/...)
# Set NEXT_PUBLIC_API_URL to empty so Next.js uses relative paths
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ── Stage 2: Monolithic Production Image ─────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# Install Node.js 20, nginx, supervisor, gettext (envsubst), and Playwright deps
RUN apt-get update && apt-get install -y curl gnupg ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y \
    nodejs \
    nginx \
    supervisor \
    gettext-base \
    build-essential \
    wget \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium browser
RUN playwright install chromium

# Copy shared Python modules (used by backend agents)
COPY langgraph_nodes ./langgraph_nodes
COPY prompts ./prompts
COPY agents ./agents
COPY utils ./utils

# Copy FastAPI backend
COPY backend ./backend
RUN mkdir -p backend/public/logos backend/public/sdk

# Copy built Next.js from Stage 1
COPY --from=frontend-builder /build/.next ./frontend/.next
COPY --from=frontend-builder /build/public ./frontend/public
COPY --from=frontend-builder /build/node_modules ./frontend/node_modules
COPY --from=frontend-builder /build/package.json ./frontend/package.json

# Copy Docker config files
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Remove default nginx site
RUN rm -f /etc/nginx/sites-enabled/default

# Render uses $PORT (default 10000); expose it
EXPOSE 10000

ENTRYPOINT ["/entrypoint.sh"]
