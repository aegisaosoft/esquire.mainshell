/*
 * Esquire frameworks (tm)
 * bootstrap — async entry (required by Webpack Module Federation)
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Module Federation requires the real entry to be in a separate async chunk.
 * index.ts just does: import('./bootstrap')
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadRuntimeConfig } from './types/RuntimeConfig';

async function main() {
  // 1. Load runtime config before React boots (same pattern as Angular mainshell)
  const config = await loadRuntimeConfig();

  // 2. Mount React app
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found');

  createRoot(container).render(
    <React.StrictMode>
      <App config={config} />
    </React.StrictMode>
  );
}

main().catch(err => {
  console.error('[mainshell] Fatal startup error:', err);
  document.body.innerHTML = `
    <div style="font-family:sans-serif;padding:40px;color:#ef4444">
      <h2>Mainshell failed to start</h2>
      <pre>${String(err)}</pre>
    </div>`;
});
