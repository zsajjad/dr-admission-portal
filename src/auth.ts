import type { NextAuthConfig, User } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { adminAuthControllerLogin } from '@/providers/service/admin-auth/admin-auth';

import { config } from '@/config';

const isCaptchaEnabled = process.env.NEXT_PUBLIC_CAPTCHA_BYPASS !== 'true';

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
      async authorize(credentials: Record<string, unknown>): Promise<User | null> {
        try {
          const { username, password, captchaToken } = credentials ?? {};
          if (!username || !password) {
            return null;
          }

          if (isCaptchaEnabled && !captchaToken) {
            return null;
          }

          const response = await adminAuthControllerLogin({
            email: username.toString(),
            password: password.toString(),
            captchaToken: isCaptchaEnabled ? (captchaToken?.toString() ?? '') : '',
          });

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
        // Initial sign in
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.requiresPasswordChange = user.requiresPasswordChange;
      } else if (trigger === 'update' && session) {
        // Update token if session is updated
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        requiresPasswordChange: token.requiresPasswordChange,
      };
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
