/*
 * Esquire frameworks (tm)
 * loadPlugin — dynamic Module Federation loader
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Injects remoteEntry.js script, initialises the MF container,
 * and returns the exposed React component.
 */

import React from 'react';
import { PluginManifest } from '../types/PluginManifest';

// Cache: pluginId → React component
const pluginCache = new Map<string, React.ComponentType>();

declare const __webpack_share_scopes__: { default: object };

/** Clear a plugin from cache (for retry after error) */
export function clearPluginCache(id: string) { pluginCache.delete(id); }

/** Inject <script> and wait for it to load */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el  = document.createElement('script');
    el.src    = src;
    el.async  = true;
    el.onload = () => resolve();
    el.onerror= () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(el);
  });
}

/** Load a plugin's React component via Module Federation */
export async function loadPlugin(manifest: PluginManifest): Promise<React.ComponentType> {
  if (pluginCache.has(manifest.id)) return pluginCache.get(manifest.id)!;

  // 1. Load the remote entry script
  await loadScript(manifest.remoteEntry);

  // 2. Get the MF container (e.g. window.rental)
  const container = (window as any)[manifest.id];
  if (!container) throw new Error(`MF container not found: window.${manifest.id}`);

  // 3. Share the host's scope
  await container.init(__webpack_share_scopes__.default);

  // 4. Get the exposed module (e.g. "./App")
  const factory   = await container.get(manifest.exposedModule);
  const Component = factory().default as React.ComponentType;

  pluginCache.set(manifest.id, Component);
  return Component;
}

/** Fetch all plugin manifests from plugins.config.json */
export async function fetchManifests(pluginsConfigUrl: string): Promise<PluginManifest[]> {
  const cfgRes = await fetch(pluginsConfigUrl);
  const cfg    = await cfgRes.json() as { plugins: { id: string; manifestUrl: string }[] };

  const results = await Promise.allSettled(
    cfg.plugins.map(async (entry) => {
      const [manifestRes, healthRes] = await Promise.allSettled([
        fetch(entry.manifestUrl),
        fetch(entry.manifestUrl.replace('/manifest', '/health')),
      ]);

      if (manifestRes.status === 'rejected' || !manifestRes.value.ok) {
        console.warn(`[mainshell] Plugin manifest unavailable: ${entry.id}`);
        return null;
      }

      const manifest: PluginManifest = await manifestRes.value.json();
      manifest.healthy = healthRes.status === 'fulfilled' && healthRes.value.ok;
      return manifest;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<PluginManifest | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((m): m is PluginManifest => m !== null);
}
