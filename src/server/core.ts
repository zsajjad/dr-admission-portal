/**
 * Server-only access to the core API (the backend).
 *
 * The browser never calls the API itself: it calls this app's /api/core/* route, and this
 * module adds what only the server holds: the API key, the portal secret (x-portal-secret)
 * and the user's access token from the encrypted session cookie. Nothing here may be imported
 * by client code; none of these values are NEXT_PUBLIC_.
 */

// During the rollout the old public variables still work, so a deploy without the new ones keeps running.
const CORE_API_URL = (process.env.CORE_API_URL || process.env.NEXT_PUBLIC_API_DOMAIN || '').replace(/\/+$/, '');
const CORE_API_KEY = process.env.CORE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
const PORTAL_PROXY_SECRET = process.env.PORTAL_PROXY_SECRET || '';

export const CORE_TIMEOUT_MS = Number.parseInt(process.env.CORE_TIMEOUT_MS ?? '25000', 10);

/** The visitor's IP as Netlify saw it (x-nf-client-connection-ip), else the first X-Forwarded-For entry. */
export function clientIpFrom(headers: Headers): string | undefined {
  const netlify = headers.get('x-nf-client-connection-ip')?.trim();
  if (netlify) return netlify;
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
}

export interface CoreCallOptions {
  accessToken?: string;
  clientIp?: string;
}

/** Headers every call to the core API carries. */
export function coreHeaders({ accessToken, clientIp }: CoreCallOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'x-api-key': CORE_API_KEY,
    'x-channel': 'APP_PORTAL',
    medium: 'platform-web',
  };
  if (PORTAL_PROXY_SECRET) headers['x-portal-secret'] = PORTAL_PROXY_SECRET;
  if (clientIp) headers['x-client-ip'] = clientIp;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

export function coreUrl(path: string): string {
  if (!CORE_API_URL) throw new Error('CORE_API_URL is not set');
  return `${CORE_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** POSTs JSON to the core API from the server and returns the parsed body, or null when the call fails. */
export async function corePostJson<T>(path: string, body: unknown, options: CoreCallOptions = {}): Promise<T | null> {
  const response = await fetch(coreUrl(path), {
    method: 'POST',
    headers: { ...coreHeaders(options), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(CORE_TIMEOUT_MS),
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}
