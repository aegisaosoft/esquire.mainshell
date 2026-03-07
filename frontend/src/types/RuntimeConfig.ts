/*
 * Esquire frameworks (tm)
 * RuntimeConfig — loaded from /assets/config.json at startup
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

export interface RuntimeConfig {
  keycloakUrl:       string;
  keycloakRealm:     string;
  keycloakClientId:  string;
  apiBasePath:       string;   // URL to Java gateway, e.g. http://localhost:7070
  pluginsConfigUrl:  string;   // URL to plugins.config.json
}

let _config: RuntimeConfig | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (_config) return _config;
  const res = await fetch('/assets/config.json');
  if (!res.ok) throw new Error('Failed to load /assets/config.json');
  _config = await res.json();
  return _config!;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!_config) throw new Error('RuntimeConfig not loaded yet');
  return _config;
}
