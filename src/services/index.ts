/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'query-string';

import { config } from '@/config';

const API_URL = config.PUBLIC_API_DOMAIN;
const API_KEY = config.API_KEY;

interface IDefaultHeadersProps {
  medium: string;
  'Content-Type': string;
  Authorization?: string;
  'x-api-key'?: string;
  'x-channel': string;
}

const defaultHeaders: IDefaultHeadersProps = {
  medium: 'platform-web',
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  'x-channel': 'APP_PORTAL',
};

// Token refresh state
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let refreshTokenValue: string | null = null;
let onTokenRefreshed: ((success: boolean) => void) | null = null;

export function setAuthenticationHeader(token: string): void {
  defaultHeaders.Authorization = `Bearer ${token}`;
}

export function getAuthenticationToken(): string | undefined {
  return defaultHeaders?.Authorization;
}

export function removeAuthenticationHeader(): void {
  delete defaultHeaders.Authorization;
}

export function setRefreshToken(token: string): void {
  refreshTokenValue = token;
}

export function getRefreshToken(): string | null {
  return refreshTokenValue;
}

export function setTokenRefreshCallback(callback: (success: boolean) => void): void {
  onTokenRefreshed = callback;
}

// Refresh the access token using the refresh token
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshTokenValue) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-channel': 'APP_PORTAL',
        medium: 'platform-web',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (data.accessToken && data.refreshToken) {
      // Update tokens
      setAuthenticationHeader(data.accessToken);
      refreshTokenValue = data.refreshToken;

      // Notify callback (to update NextAuth session)
      if (onTokenRefreshed) {
        onTokenRefreshed(true);
      }

      // Dispatch custom event for session update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tokenRefreshed', {
            detail: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            },
          }),
        );
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// Handle token refresh with request queuing
async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    // Wait for the ongoing refresh
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
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
  baseDomain?: string;
  parseJSON?: boolean;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob';
}

type UpperHttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

async function service<T = any>(args: IAPArgs, isRetry = false): Promise<T> {
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
    ...extraProps
  } = args;

  const props: RequestInit & { noAuth?: boolean } = {
    method: (method as string).toUpperCase() as UpperHttpMethod,
    headers: { ...defaultHeaders, ...headers } as Record<string, string>,
    ...extraProps,
  };

  const isGet = (method as string).toUpperCase() === 'GET';
  if (isGet) {
    props.body = null;
    // @ts-expect-error content type checking
  } else if (props?.headers?.['Content-Type'] !== 'multipart/form-data' && !formData) {
    props.body = JSON.stringify(data);
  } else {
    props.body = data as BodyInit;
  }

  // @ts-expect-error content type checking
  if (props?.headers?.['Content-Type'] === 'multipart/form-data') {
    delete (props.headers as Record<string, string>)['Content-Type'];
  }
  if (extraProps.noAuth) {
    delete (props.headers as Record<string, string>).Authorization;
  }
  let fetchUrl = `${baseDomain || API_URL}${url}`;
  if (params) {
    fetchUrl = `${fetchUrl}?${qs.stringify(params, {
      arrayFormat: 'bracket',
    })}`;
  }

  try {
    // logSuccess('REQUESTING', fetchUrl, JSON.stringify(props));
    const response = await fetch(fetchUrl, props);

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !isRetry && !extraProps.noAuth) {
      // Don't try to refresh for auth endpoints
      const isAuthEndpoint = url.includes('/admin/auth/');
      if (!isAuthEndpoint) {
        const refreshSuccess = await handleTokenRefresh();
        if (refreshSuccess) {
          // Retry the original request with new token
          return service<T>(args, true);
        }
      }
      // Refresh failed or auth endpoint - throw 401 error
      const error = await response.json().catch(() => ({ statusCode: 401, message: 'Unauthorized' }));
      throw { ...error, statusCode: 401 };
    }

    if (response.status >= 400) {
      const error = await response.json();
      throw error;
    }
    // logSuccess('RESPONSE', fetchUrl, response);
    if (responseType === 'json') {
      return parseJSON ? await response.json() : (response as T);
    } else {
      return response as T;
    }
  } catch (error) {
    throw error;
  }
}
export default service;
