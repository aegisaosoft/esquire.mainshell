// DEV ONLY — remove before production
import React from 'react';
import { useEsqAuth } from 'esq-auth-context';

export function DevAuthInfo() {
  const { isLoading, isAuthenticated, user } = useEsqAuth();

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      right: 12,
      zIndex: 9999,
      background: '#0F172A',
      color: '#CBD5E1',
      fontSize: '11px',
      fontFamily: "'Courier New', monospace",
      borderRadius: '6px',
      padding: '10px 14px',
      border: '1px solid #334155',
      lineHeight: 1.6,
      pointerEvents: 'none',
    }}>
      <div>isLoading: <b>{String(isLoading)}</b></div>
      <div>isAuthenticated: <b>{String(isAuthenticated)}</b></div>
      <div>user.name: <b>{user?.name ?? '—'}</b></div>
      <div>user.loginId: <b>{user?.loginId ?? '—'}</b></div>
      <div>roles: <b>{user?.roles?.map(r => r.name).join(', ') || '—'}</b></div>
      <div>token: <b>{user?.token ? user.token.substring(0, 40) + '…' : '—'}</b></div>
    </div>
  );
}
