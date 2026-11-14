/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCsrfToken } from 'next-auth/react';
import qs from 'query-string';

/**
 * The browser's API client (the orval mutator).
 *
 * Every call goes to this app's own server (/api/core/*, app/api/core/[...path]/route.ts), which
 * adds the user's access token, the API key and the portal secret. The browser holds none of them.
 */
const CORE_PROXY = '/api/core';

/** Fired when the login can't be refreshed any more; AuthContext signs the user out. */
export const SESSION_EXPIRED_EVENT = 'sessionExpired';

// One refresh at a time: the API replaces the refresh token on every refresh, so parallel
// refreshes would undo each other.
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Asks Auth.js to refresh the login on the server (the jwt callback in auth.ts), which writes the
 * new tokens into the session cookie. Same request as `useSession().update({ refresh: true })`.
 */
async function refreshLogin(): Promise<boolean> {
  try {
    const csrfToken = await getCsrfToken();
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csrfToken, data: { refresh: true } }),
    });
    const session = response.ok ? await response.json() : null;
    return Boolean(session && !session.error);
  } catch (error) {
    console.error('Login refresh failed:', error);
    return false;
  }
}

function refreshLoginOnce(): Promise<boolean> {
  refreshInFlight ??= refreshLogin().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export interface IAPArgs {
  url: string;
  method: UpperHttpMethod | Lowercase<UpperHttpMethod>;
  data?: unknown;
  headers?: any;
  queryParams?: Record<string, any>;
  params?: Record<string, any>;
  noAuth?: boolean;
  formData?: boolean;
  /** Another service's absolute URL, called directly without the portal's credentials. */
  baseDomain?: string;
  parseJSON?: boolean;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob';
}

type UpperHttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

async function request<T = any>(args: IAPArgs, isRetry: boolean): Promise<T> {
  const {
    url,
    method = 'GET',
    data = {},
    headers = {},
    formData = false,
    baseDomain,
    parseJSON = true,
    params = {},
    responseType = 'json',
    noAuth,
    signal,
  } = args;

  const upperMethod = (method as string).toUpperCase() as UpperHttpMethod;
  const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  const props: RequestInit = { method: upperMethod, headers: requestHeaders, signal };

  if (upperMethod === 'GET') {
    props.body = null;
  } else if (requestHeaders['Content-Type'] !== 'multipart/form-data' && !formData) {
    props.body = JSON.stringify(data);
  } else {
    props.body = data as BodyInit;
  }
  // Let the browser set multipart/form-data with its boundary.
  if (requestHeaders['Content-Type'] === 'multipart/form-data' || formData) {
    delete requestHeaders['Content-Type'];
  }

  let fetchUrl = `${baseDomain ?? CORE_PROXY}${url}`;
  if (params) {
    const query = qs.stringify(params, { arrayFormat: 'bracket' });
    if (query) fetchUrl = `${fetchUrl}?${query}`;
  }

  const response = await fetch(fetchUrl, props);

  if (response.status === 401 && !isRetry && !noAuth && !baseDomain && !url.includes('/admin/auth/')) {
    if (await refreshLoginOnce()) {
      return request<T>(args, true);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  if (response.status === 401) {
    const error = await response.json().catch(() => ({ statusCode: 401, message: 'Unauthorized' }));
    throw { ...error, statusCode: 401 };
  }
  if (response.status >= 400) {
    throw await response.json().catch(() => ({ statusCode: response.status, message: response.statusText }));
  }
  if (responseType === 'json') {
    return parseJSON ? await response.json() : (response as T);
  }
  return response as T;
}

// The orval mutator. It takes a single argument on purpose: orval adds a
// `request` option to every generated hook when the mutator has a second one.
function service<T = any>(args: IAPArgs): Promise<T> {
  return request<T>(args, false);
}
export default service;
