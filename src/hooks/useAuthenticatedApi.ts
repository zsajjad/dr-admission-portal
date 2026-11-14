'use client';

import { useSession } from 'next-auth/react';

/**
 * Whether API calls will be authenticated: the user is signed in and the login is still valid.
 * The access token itself stays on the server (see app/api/core/[...path]/route.ts).
 */
export const useAuthenticatedApi = () => {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === 'authenticated' && !session?.error,
    isLoading: status === 'loading',
  };
};
