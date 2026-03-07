/*
 * Esquire frameworks (tm)
 * EsqAuthProvider — owns keycloak-js lifecycle, provides EsqAuthCtx
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Only the mainshell creates this provider.
 * Plugins consume auth via useEsqAuth() — they never touch keycloak-js directly.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import {
  EsqAuthCtx,
  EsqAuthUser,
  isCommandAllowed as calcPermission
} from 'esq-auth-context';
import { RuntimeConfig } from '../types/RuntimeConfig';
import { fetchAccessProfile } from './fetchAccessProfile';

interface Props {
  config:   RuntimeConfig;
  children: React.ReactNode;
}

// Keycloak singleton — created once per app lifetime
let _kc: Keycloak | null = null;

function getKc(config: RuntimeConfig): Keycloak {
  if (!_kc) {
    _kc = new Keycloak({
      url:      config.keycloakUrl,
      realm:    config.keycloakRealm,
      clientId: config.keycloakClientId,
    });
  }
  return _kc;
}

export function EsqAuthProvider({ config, children }: Props) {
  const [user,      setUser]    = useState<EsqAuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const refreshTimer            = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── helper: populate user from token + keySmith profile ──────────────────
  const hydrateUser = useCallback(async (kc: Keycloak) => {
    try {
      const profile = await fetchAccessProfile(config.apiBasePath, kc.token!);
      setUser({ ...profile, token: kc.token! });
    } catch (err) {
      console.error('[EsqAuthProvider] fetchAccessProfile failed:', err);
      // Still mark as loaded — user will see login screen
    }
  }, [config.apiBasePath]);

  // ─── init keycloak ─────────────────────────────────────────────────────────
  useEffect(() => {
    const kc = getKc(config);

    kc.init({
      onLoad:          'check-sso',
      pkceMethod:      'S256',
      checkLoginIframe: false,
    })
    .then(async (authenticated) => {
      if (authenticated) {
        await hydrateUser(kc);

        // ── auto-refresh token 30s before expiry ──────────────────────────
        refreshTimer.current = setInterval(() => {
          kc.updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                setUser(u => u ? { ...u, token: kc.token! } : null);
              }
            })
            .catch(() => {
              console.warn('[EsqAuthProvider] Token refresh failed, logging out');
              kc.logout();
            });
        }, 30_000);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error('[EsqAuthProvider] Keycloak init failed:', err);
      setLoading(false);
    });

    // on keycloak token expiry event
    kc.onTokenExpired = () => {
      kc.updateToken(30).catch(() => kc.logout());
    };

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const kc = getKc(config);

  const ctx = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login:           () => kc.login(),
    logout:          () => { setUser(null); kc.logout(); },
    hasRole:         (roleName: string) =>
                       user?.roles.some(r => r.name === roleName) ?? false,
    hasAnyRole:      (...names: string[]) =>
                       names.some(n => user?.roles.some(r => r.name === n) ?? false),
    isCommandAllowed:(cmd: string, entityId: string, kind: number) =>
                       calcPermission(user, cmd, entityId, kind),
  };

  return (
    <EsqAuthCtx.Provider value={ctx}>
      {children}
    </EsqAuthCtx.Provider>
  );
}
