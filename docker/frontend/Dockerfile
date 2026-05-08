# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

# ── Stage 2: Build the Next.js application ───────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./

# Build-time env var: the URL of the backend API
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ── Stage 3: Production runtime ───────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
