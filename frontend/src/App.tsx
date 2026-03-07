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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
        <div style={{ color: '#94A3B8', fontSize: '14px' }}>Checking session…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0F172A', gap: '16px'
      }}>
        <h1 style={{ color: '#A8D8F0', fontSize: '28px', margin: 0 }}>ESQUIRE</h1>
        <p  style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>Please sign in to continue</p>
        <button
          onClick={login}
          style={{
            background: '#2E74B5', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px',
          }}
        >
          Sign in with Keycloak
        </button>
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
