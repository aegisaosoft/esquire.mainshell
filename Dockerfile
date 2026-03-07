# Esquire frameworks (tm)
# mainshell Dockerfile
# Copyright(c) 2001, 2026 Aegis AO Soft LLC

# ─── Stage 1: Build React frontend ───────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /build

# Copy shared auth context package
COPY packages/ ./packages/

# Install & build frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Runtime — Node.js proxy ────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Install proxy dependencies
COPY proxy/package*.json ./proxy/
RUN cd proxy && npm ci --omit=dev

# Copy built frontend
COPY --from=builder /build/frontend/dist ./frontend/dist

# Copy proxy code
COPY proxy/ ./proxy/

# Default plugins config (override via volume mount in compose)
COPY plugins.config.json ./plugins.config.json

ENV PORT=3000
ENV KEYCLOAK_URL=http://localhost:8080
ENV KEYCLOAK_REALM=esquire
ENV KEYCLOAK_CLIENT_ID=esq-react
ENV API_BASE_PATH=http://localhost:7070
ENV PLUGINS_CONFIG_URL=/plugins.config.json
ENV PLUGINS_CONFIG_FILE=/app/plugins.config.json

EXPOSE 3000

CMD ["node", "proxy/server.js"]
