/*
 * Esquire frameworks (tm)
 * PluginManifest — contract every plugin MUST implement at GET /manifest
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

export interface NavBarItem {
  label:  string;
  icon:   string;
  route:  string;
  order:  number;
}

export interface ToolbarButton {
  id:     string;
  label:  string;
  icon:   string;
  action: string; // forwarded to active plugin via window.postMessage
}

export interface MenuItem {
  id:     string;
  label:  string;
  route?: string;
  action?:string;
}

export interface PluginManifest {
  id:            string;  // unique, matches Module Federation container name
  version:       string;
  displayName:   string;
  navBar:        NavBarItem;
  toolbar:       ToolbarButton[];
  menu:          MenuItem[];
  remoteEntry:   string;  // URL to remoteEntry.js
  exposedModule: string;  // e.g. "./App"
  requiredRoles: string[];
  healthy?:      boolean; // set by mainshell after health check
}
