/*
 * Esquire frameworks (tm)
 * esq-auth-context — shared auth types
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Mirrors EsqAccessProfile from keySmith service.
 * MUST stay in sync with backend EsqAccessProfile.java
 */

export interface EsqRole {
  id:       number;
  name:     string;
  adminFlg: string; // 'Y' | 'N'
}

export interface EsqPermission {
  id:    string;
  kind:  number;
  name:  string;
  type:  string;
  flags: string[]; // ['Y','N','Y',...] indexed by CMD_* constants
}

export interface EsqAuthUser {
  // from keySmith EsqAccessProfile
  id:               string;
  kind:             number;
  name:             string;
  loginId:          string;
  email:            string;
  pwdChangeForced:  string;
  tfaMethod:        string;
  roles:            EsqRole[];
  admin:            EsqPermission[];
  tools:            EsqPermission[];
  // from keycloak-js
  token:            string; // current JWT access_token (auto-refreshed by mainshell)
}

// ─── Permission flag indices — keep in sync with keySmith CMD_ constants ─────
export const CMD_NEW     = 'CMD_NEW';
export const CMD_DEFAULT = 'CMD_DEFAULT';
export const CMD_MOVE    = 'CMD_MOVE';
export const CMD_DELETE  = 'CMD_DELETE';
export const CMD_KEY     = 'CMD_KEY';
export const CMD_ACCT    = 'CMD_ACCT';

const FLAG_INDEX: Record<string, number> = {
  [CMD_NEW]:     0,
  [CMD_DEFAULT]: 1,
  [CMD_MOVE]:    1,
  [CMD_DELETE]:  2,
  [CMD_KEY]:     3,
  [CMD_ACCT]:    4,
};

export function isCommandAllowed(
  user:     EsqAuthUser | null,
  cmd:      string,
  entityId: string,
  kind:     number
): boolean {
  if (!user) return false;
  // personal mode: owner always allowed
  if (String(user.id) === String(entityId)) return true;

  const knd         = Math.floor(kind / 2) * 2;
  const effectiveCmd = cmd || CMD_DEFAULT;
  const perm        = user.admin.find(p => p.kind === knd);
  if (!perm) return false;

  const flagIndex = FLAG_INDEX[effectiveCmd];
  if (flagIndex === undefined || flagIndex >= perm.flags.length) return false;
  return perm.flags[flagIndex] === 'Y';
}
