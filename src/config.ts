import { getSiteURL } from '@/platform/Info/getSiteUrl';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string; id: string };
  logLevel: string;
  PUBLIC_API_DOMAIN: string;
  AUTH_LOGIN_URL: string;
  AUTH_SECRET_KEY: string;
  NEXTAUTH_SECRET?: string;
  ACTIVITY_LOGGER_PUBLIC_API_URL: string;
  ACTIVITY_POLLING_INTERVAL?: number;
  API_KEY: string;
  CAPTCHA_BYPASS: string;
  TURNSTILE_SITE_KEY: string;
}

export const config: Config = {
  site: {
    url: getSiteURL(),
    themeColor: '#1E1033',
    id: process.env.NEXT_PUBLIC_APP_ID ?? 'admin-dashboard',
    description: 'Danishgah e Ramzan Admin Portal',
    name: process.env.NEXTAPP_NAME ?? 'Danishgah e Ramzan Admin Portal',
  },
  PUBLIC_API_DOMAIN: process.env.NEXT_PUBLIC_API_DOMAIN ?? '',
  AUTH_LOGIN_URL: process.env.NEXTAUTH_URL ?? '',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL ?? 'ALL',
  AUTH_SECRET_KEY: process.env.NEXTAUTH_SECRET ?? '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? '',
  ACTIVITY_POLLING_INTERVAL: process.env.NEXT_PUBLIC_ACTIVITY_POLLING_INTERVAL
    ? parseInt(process.env.NEXT_PUBLIC_ACTIVITY_POLLING_INTERVAL)
    : 10000,
  ACTIVITY_LOGGER_PUBLIC_API_URL: process.env.NEXT_PUBLIC_ACTIVITY_LOGGER_API_DOMAIN ?? '',
  API_KEY: process.env.NEXT_PUBLIC_API_KEY ?? '',
  CAPTCHA_BYPASS: process.env.NEXT_PUBLIC_CAPTCHA_BYPASS ?? 'false',
  TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
};
