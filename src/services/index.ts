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

export function setAuthenticationHeader(token: string): void {
  defaultHeaders.Authorization = `Bearer ${token}`;
}

export function getAuthenticationToken(): string | undefined {
  return defaultHeaders?.Authorization;
}

export function removeAuthenticationHeader(): void {
  delete defaultHeaders.Authorization;
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

async function service<T = any>(args: IAPArgs): Promise<T> {
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
    const data = await fetch(fetchUrl, props);
    if (data.status >= 400) {
      const error = await data.json();
      throw error;
    }
    // logSuccess('RESPONSE', fetchUrl, data);
    if (responseType === 'json') {
      return parseJSON ? await data.json() : (data as T);
    } else {
      return data as T;
    }
  } catch (error) {
    throw error;
  }
}
export default service;
