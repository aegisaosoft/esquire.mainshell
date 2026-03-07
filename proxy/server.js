/*
 * Esquire frameworks (tm)
 * mainshell proxy — Node.js Express server
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Responsibilities:
 *   1. Serve React frontend build (dist/)
 *   2. Serve runtime config.json (populated from env vars)
 *   3. Serve plugins.config.json (volume-mounted, hot-reloaded)
 *   4. Proxy /api/* → Java gateway (passes Bearer token through)
 *   5. SPA fallback → index.html
 */

'use strict';

const express    = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path       = require('path');
const fs         = require('fs');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const DIST = path.join(__dirname, '../frontend/dist');

// ─── 1. Runtime config (from env vars — MUST be before static files) ──────
//    express.static would serve the bundled config.json with localhost defaults,
//    so this dynamic route must win.
app.get('/assets/config.json', (req, res) => {
  res.json({
    keycloakUrl:      process.env.KEYCLOAK_URL      || 'http://localhost:8080',
    keycloakRealm:    process.env.KEYCLOAK_REALM    || 'esquire',
    keycloakClientId: process.env.KEYCLOAK_CLIENT_ID|| 'esq-react',
    apiBasePath:      process.env.API_BASE_PATH     ?? 'http://localhost:7070',
    pluginsConfigUrl: process.env.PLUGINS_CONFIG_URL|| '/plugins.config.json',
  });
});

// ─── 2. Plugins config (volume-mounted JSON, re-read on each request) ─────
const PLUGINS_CONFIG_FILE = process.env.PLUGINS_CONFIG_FILE
  || path.join(__dirname, '../plugins.config.json');

app.get('/plugins.config.json', (req, res) => {
  try {
    const raw = fs.readFileSync(PLUGINS_CONFIG_FILE, 'utf8');
    res.type('application/json').send(raw);
  } catch (err) {
    console.error('[proxy] plugins.config.json not found:', err.message);
    res.status(500).json({ error: 'plugins.config.json not found' });
  }
});

// ─── 3. Frontend static files ──────────────────────────────────────────────
app.use(express.static(DIST));

// ─── 4. Proxy /api/* → Java gateway ───────────────────────────────────────
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:7070';

app.use('/api', createProxyMiddleware({
  target:       GATEWAY_URL,
  changeOrigin: true,
  pathRewrite:  { '^/': '/api/' },   // Express strips /api, re-add for gateway
  on: {
    error: (err, req, res) => {
      console.error('[proxy] Gateway proxy error:', err.message);
      res.status(502).json({ error: 'Gateway unavailable', detail: err.message });
    },
  },
}));

// ─── 5. SPA fallback ──────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[mainshell] listening on :${PORT}`);
  console.log(`[mainshell] gateway  → ${GATEWAY_URL}`);
  console.log(`[mainshell] plugins  ← ${PLUGINS_CONFIG_FILE}`);
});
