import type { NextAuthConfig, User } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import type { AdminLoginResponseDto, AdminRefreshResponseDto } from '@/providers/service/app.schemas';

import { config } from '@/config';
import { clientIpFrom, corePostJson } from '@/server/core';

// Keep captcha logic consistent between client UI and server authorize():
// captcha is only enforced when a Turnstile site key exists AND bypass isn't enabled.
const isCaptchaEnabled = Boolean(config.TURNSTILE_SITE_KEY) && config.CAPTCHA_BYPASS !== 'true';

const defaultCredentials = {
  username: { label: 'Username', type: 'text' },
  password: { label: 'Password', type: 'password' },
};

const Credentials = isCaptchaEnabled
  ? {
      ...defaultCredentials,
      captchaToken: { label: 'Captcha Token', type: 'text' },
    }
  : defaultCredentials;

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: config.site.id,
      name: config.site.name,
      credentials: Credentials,
      async authorize(credentials: Record<string, unknown>, request: Request): Promise<User | null> {
        try {
          const { username, password, captchaToken } = credentials ?? {};
          if (!username || !password) {
            return null;
          }

          if (isCaptchaEnabled && !captchaToken) {
            return null;
          }

          // Runs on the portal's server, which adds the API key and the portal secret. The tokens
          // stay in the encrypted session cookie; the browser never sees them.
          const response = await corePostJson<AdminLoginResponseDto>(
            '/admin/auth/login',
            {
              email: username.toString(),
              password: password.toString(),
              captchaToken: isCaptchaEnabled ? (captchaToken?.toString() ?? '') : '',
            },
            { clientIp: clientIpFrom(request.headers) },
          );

          if (response && response.accessToken && response.refreshToken) {
            const user: User = {
              id: username.toString(),
              name: username.toString(),
              email: username.toString(),
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              requiresPasswordChange: response.requiresPasswordChange,
            };
            return user;
          }

          return null;
        } catch (error) {
          if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
            console.error('Error in NextAuth authorize: login timed out');
            return null;
          }
          console.error('Error in NextAuth authorize:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    error: '/auth/sign-in',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'signIn' && user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.requiresPasswordChange = user.requiresPasswordChange;
        delete token.error;
        return token;
      }

      if (trigger === 'update' && session) {
        // The browser asks for a refresh (`update({ refresh: true })`) after the API answers 401.
        // Only here, where Auth.js writes the new cookie, because the API replaces the refresh
        // token on every refresh: a refresh whose cookie is never written would log the user out.
        if (session.refresh === true && token.refreshToken) {
          const refreshed = await corePostJson<AdminRefreshResponseDto>('/admin/auth/refresh', {
            refreshToken: token.refreshToken,
          }).catch(() => null);
          if (refreshed?.accessToken && refreshed.refreshToken) {
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken;
            token.requiresPasswordChange = refreshed.requiresPasswordChange;
            delete token.error;
          } else {
            token.error = 'RefreshFailed';
          }
        }
        if (typeof session.requiresPasswordChange === 'boolean') {
          token.requiresPasswordChange = session.requiresPasswordChange;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // No tokens here: this object is sent to the browser (/api/auth/session).
      return {
        ...session,
        requiresPasswordChange: token.requiresPasswordChange,
        error: token.error,
      };
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
