/*
 * Esquire frameworks (tm)
 * fetchAccessProfile — loads EsqAuthUser from keySmith via gateway
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 *
 * Endpoint: GET {apiBasePath}/esq-key
 * Returns:  EsqAccessProfile (same shape as EsqAuthUser minus token)
 */

import { EsqAuthUser } from 'esq-auth-context';

export async function fetchAccessProfile(
  apiBasePath: string,
  token:       string
): Promise<Omit<EsqAuthUser, 'token'>> {
  const res = await fetch(`${apiBasePath}/esq-key`, {
    headers: {
      Authorization:    `Bearer ${token}`,
      'Content-Type':   'application/json',
      'X-Request-ID':   crypto.randomUUID(),
    }
  });

  if (!res.ok) {
    throw new Error(`fetchAccessProfile failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
