/*
 * Esquire frameworks (tm)
 * NavBar — left navigation bar, built from plugin manifests
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

import React from 'react';
import { PluginManifest } from '../types/PluginManifest';
import { useEsqAuth } from 'esq-auth-context';

interface Props {
  manifests:     PluginManifest[];
  activePlugin:  string | null;
  onSelect:      (manifest: PluginManifest) => void;
}

export function NavBar({ manifests, activePlugin, onSelect }: Props) {
  const { hasAnyRole } = useEsqAuth();

  const visible = manifests
    .filter(m => m.requiredRoles.length === 0 || hasAnyRole(...m.requiredRoles))
    .sort((a, b) => a.navBar.order - b.navBar.order);

  return (
    <nav style={{
      width:      '200px',
      background: '#1A2744',
      flexShrink: 0,
      display:    'flex',
      flexDirection: 'column',
      paddingTop: '8px',
      borderRight:'1px solid #2D3A5E',
      overflowY:  'auto',
      overflowX:  'hidden',
    }}>
      {visible.map(m => {
        const isActive = m.id === activePlugin;
        const isDown   = m.healthy === false;

        return (
          <button
            key={m.id}
            onClick={() => !isDown && onSelect(m)}
            title={isDown ? `${m.displayName} — unavailable` : m.displayName}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '10px',
              padding:        '10px 14px',
              background:     isActive ? '#2E74B5' : 'transparent',
              border:         'none',
              borderLeft:     isActive ? '3px solid #A8D8F0' : '3px solid transparent',
              color:          isDown ? '#4A5568' : isActive ? '#fff' : '#94A3B8',
              cursor:         isDown ? 'not-allowed' : 'pointer',
              fontSize:       '13px',
              textAlign:      'left',
              transition:     'border-color 0.15s, background 0.15s',
            }}
          >
            <NavIcon name={m.navBar.icon} />
            <span>{m.navBar.label}</span>
            {isDown && <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#EF4444' }}>●</span>}
          </button>
        );
      })}
    </nav>
  );
}

/** Minimal icon renderer — replace with lucide-react if preferred */
function NavIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    car:        '🚗',
    toll:       '🛣️',
    market:     '🛍️',
    admin:      '⚙️',
    dashboard:  '📊',
    users:      '👥',
    settings:   '🔧',
    reports:    '📋',
  };
  return <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icons[name] || '◆'}</span>;
}
