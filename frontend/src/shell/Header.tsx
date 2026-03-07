/*
 * Esquire frameworks (tm)
 * Header — top bar with logo, app name, user info, logout
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

import React from 'react';
import { useEsqAuth } from 'esq-auth-context';

export function Header() {
  const { user, isAuthenticated, login, logout } = useEsqAuth();

  return (
    <header style={{
      height:         '48px',
      background:     '#1F3864',
      color:          '#fff',
      display:        'flex',
      alignItems:     'center',
      padding:        '0 16px',
      gap:            '12px',
      flexShrink:     0,
      boxShadow:      '0 2px 4px rgba(0,0,0,0.3)',
      zIndex:         100,
    }}>
      {/* Logo / brand */}
      <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '1px', color: '#A8D8F0' }}>
        ESQUIRE
      </span>

      <div style={{ flex: 1 }} />

      {/* User info */}
      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <span style={{ color: '#CBD5E1' }}>
            {user.name}
            {user.roles.length > 0 && (
              <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                [{user.roles.map(r => r.name).join(', ')}]
              </span>
            )}
          </span>
          <button
            onClick={logout}
            style={{
              background:   'transparent',
              border:       '1px solid #475569',
              color:        '#CBD5E1',
              borderRadius: '4px',
              padding:      '3px 10px',
              cursor:       'pointer',
              fontSize:     '12px',
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          style={{
            background:   '#2E74B5',
            border:       'none',
            color:        '#fff',
            borderRadius: '4px',
            padding:      '4px 14px',
            cursor:       'pointer',
            fontSize:     '13px',
          }}
        >
          Sign in
        </button>
      )}
    </header>
  );
}
