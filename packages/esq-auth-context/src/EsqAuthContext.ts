/*
 * Esquire frameworks (tm)
 * esq-auth-context — React context + hook
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Shared as a singleton via Webpack Module Federation.
 * The mainshell owns the Provider. Plugins consume via useEsqAuth().
 */

import { createContext, useContext } from 'react';
import { EsqAuthUser, isCommandAllowed } from './types';

export interface EsqAuthContextValue {
  user:            EsqAuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           () => void;
  logout:          () => void;
  hasRole:         (roleName: string) => boolean;
  hasAnyRole:      (...roleNames: string[]) => boolean;
  isCommandAllowed:(cmd: string, entityId: string, kind: number) => boolean;
}

const defaults: EsqAuthContextValue = {
  user:            null,
  isAuthenticated: false,
  isLoading:       true,
  login:           () => {},
  logout:          () => {},
  hasRole:         () => false,
  hasAnyRole:      () => false,
  isCommandAllowed:() => false,
};

export const EsqAuthCtx = createContext<EsqAuthContextValue>(defaults);

/** Use inside any plugin component to access the authenticated user. */
export const useEsqAuth = (): EsqAuthContextValue => useContext(EsqAuthCtx);
