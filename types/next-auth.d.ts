import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /** Sent to the browser: never put the API tokens here. */
  interface Session extends DefaultSession {
    requiresPasswordChange?: boolean;
    /** Set when the API refused to refresh the login; the user has to sign in again. */
    error?: 'RefreshFailed';
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
  /** Lives only in the encrypted session cookie, read on the server. */
  interface JWT {
    accessToken: string;
    refreshToken: string;
    requiresPasswordChange?: boolean;
    error?: 'RefreshFailed';
  }
}
