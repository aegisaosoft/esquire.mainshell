/*
 * Esquire frameworks (tm)
 * App — mainshell root component
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

import React, { useState, useEffect } from 'react';
import { EsqAuthProvider } from './auth/EsqAuthProvider';
import { useEsqAuth } from 'esq-auth-context';
import { Header } from './shell/Header';
import { NavBar } from './shell/NavBar';
import { Toolbar } from './shell/Toolbar';
import { PluginArea } from './shell/PluginArea';
import { fetchManifests } from './shell/loadPlugin';
import { RuntimeConfig } from './types/RuntimeConfig';
import { PluginManifest } from './types/PluginManifest';
import { DevAuthInfo } from './auth/DevAuthInfo';

// ─── Inner shell — rendered only when config is ready ─────────────────────────
function Shell({ config }: { config: RuntimeConfig }) {
  const { isAuthenticated, isLoading, login } = useEsqAuth();
  const [manifests,     setManifests]     = useState<PluginManifest[]>([]);
  const [activePlugin,  setActivePlugin]  = useState<PluginManifest | null>(null);

  // Load plugin manifests once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchManifests(config.pluginsConfigUrl)
      .then(ms => {
        setManifests(ms);
        // auto-select first healthy plugin
        const first = ms.find(m => m.healthy !== false);
        if (first) setActivePlugin(first);
      })
      .catch(err => console.error('[App] fetchManifests failed:', err));
  }, [isAuthenticated]);

  // Poll plugin health every 30s
  useEffect(() => {
    if (!isAuthenticated || manifests.length === 0) return;
    const t = setInterval(() => {
      fetchManifests(config.pluginsConfigUrl)
        .then(setManifests)
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(t);
  }, [isAuthenticated, manifests.length]);

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ color: '#64748B', fontSize: '14px' }}>Checking session…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <header style={{
          height: '48px', background: '#1F3864', color: '#fff',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 100,
        }}>
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '1px', color: '#A8D8F0' }}>
            ESQUIRE
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={login}
            style={{
              background: '#2E74B5', color: '#fff', border: 'none',
              borderRadius: '4px', padding: '5px 16px', cursor: 'pointer',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Login
          </button>
        </header>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      <Header />
      <Toolbar activeManifest={activePlugin} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NavBar
          manifests={manifests}
          activePlugin={activePlugin?.id ?? null}
          onSelect={setActivePlugin}
        />
        <PluginArea manifest={activePlugin} />
      </div>
      {process.env.NODE_ENV === 'development' && <DevAuthInfo />}
    </div>
  );
}

// ─── Root — wraps everything in EsqAuthProvider ────────────────────────────────
interface AppProps {
  config: RuntimeConfig;
}

export function App({ config }: AppProps) {
  return (
    <EsqAuthProvider config={config}>
      <Shell config={config} />
    </EsqAuthProvider>
  );
}
