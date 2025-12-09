import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string;
    refreshToken: string;
    requiresPasswordChange?: boolean;
  }

  interface User {
    id: string;
    email?: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    requiresPasswordChange?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    requiresPasswordChange?: boolean;
  }
}
