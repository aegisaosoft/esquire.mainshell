/*
 * Esquire frameworks (tm)
 * PluginArea — mounts the active plugin component (loaded via Module Federation)
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { PluginManifest } from '../types/PluginManifest';
import { loadPlugin, clearPluginCache } from './loadPlugin';

interface Props {
  manifest: PluginManifest | null;
}

export function PluginArea({ manifest }: Props) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);

  const doLoad = useCallback((m: PluginManifest) => {
    setLoading(true);
    setError(null);

    loadPlugin(m)
      .then(C => { setComponent(() => C); setLoading(false); })
      .catch(err => {
        console.error('[PluginArea] load failed:', err);
        setError(`Failed to load plugin "${m.displayName}": ${err.message}`);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!manifest) {
      setComponent(null);
      setError(null);
      return;
    }
    doLoad(manifest);
  }, [manifest?.id]);

  if (!manifest) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '48px', fontWeight: 700, color: '#1E2A3A', letterSpacing: '4px', userSelect: 'none' }}>
          ESQUIRE
        </span>
        <span style={{ color: '#64748B', fontSize: '13px' }}>
          Select a module from the navigation bar
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <div className="esq-spinner" />
        <span style={{ color: '#94A3B8', fontSize: '13px' }}>
          Loading {manifest.displayName}…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '24px' }}>⚠</span>
        <span style={{ color: '#EF4444', fontSize: '13px', maxWidth: '400px', textAlign: 'center' }}>
          {error}
        </span>
        <button
          onClick={() => {
            clearPluginCache(manifest.id);
            doLoad(manifest);
          }}
          style={{
            padding: '6px 16px', background: '#2E74B5', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Component) return null;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="esq-spinner" />
        </div>
      }>
        <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
          <Component />
        </div>
      </Suspense>
    </div>
  );
}
