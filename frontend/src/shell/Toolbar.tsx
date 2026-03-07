/*
 * Esquire frameworks (tm)
 * Toolbar — horizontal toolbar below header, populated from active plugin manifest
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Toolbar actions are forwarded to the active plugin via window.postMessage.
 * Plugin listens for: { type: 'ESQ_TOOLBAR_ACTION', action: 'OPEN_NEW_FORM', pluginId: 'rental' }
 */

import React from 'react';
import { PluginManifest, ToolbarButton } from '../types/PluginManifest';

interface Props {
  activeManifest: PluginManifest | null;
}

export function Toolbar({ activeManifest }: Props) {
  if (!activeManifest || activeManifest.toolbar.length === 0) {
    return <div style={{ height: '36px', background: '#F0F4F8', borderBottom: '1px solid #CBD5E1', flexShrink: 0 }} />;
  }

  const dispatch = (btn: ToolbarButton) => {
    window.postMessage({
      type:     'ESQ_TOOLBAR_ACTION',
      action:   btn.action,
      pluginId: activeManifest.id,
    }, '*');
  };

  return (
    <div style={{
      height:       '36px',
      background:   '#F0F4F8',
      borderBottom: '1px solid #CBD5E1',
      display:      'flex',
      alignItems:   'center',
      padding:      '0 8px',
      gap:          '4px',
      flexShrink:   0,
    }}>
      <span style={{ fontSize: '11px', color: '#64748B', marginRight: '8px', fontWeight: 600 }}>
        {activeManifest.displayName}
      </span>
      <div style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 4px' }} />
      {activeManifest.toolbar.map(btn => (
        <button
          key={btn.id}
          onClick={() => dispatch(btn)}
          title={btn.label}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '5px',
            padding:      '3px 10px',
            background:   'transparent',
            border:       '1px solid transparent',
            borderRadius: '3px',
            cursor:       'pointer',
            fontSize:     '12px',
            color:        '#334155',
            transition:   'background 0.1s, border-color 0.1s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background    = '#E2E8F0';
            (e.currentTarget as HTMLButtonElement).style.borderColor   = '#94A3B8';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background    = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor   = 'transparent';
          }}
        >
          <ToolIcon name={btn.icon} />
          {btn.label}
        </button>
      ))}
    </div>
  );
}

function ToolIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    plus:     '＋',
    download: '⬇',
    refresh:  '↻',
    save:     '💾',
    delete:   '🗑',
    edit:     '✏️',
    search:   '🔍',
    filter:   '⊟',
    print:    '🖨',
  };
  return <span style={{ fontSize: '12px' }}>{icons[name] || '▸'}</span>;
}
