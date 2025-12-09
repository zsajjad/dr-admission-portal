'use client';

import { useSession } from 'next-auth/react';

/**
 * Hook to check if API calls will be authenticated
 * Useful for conditional rendering or logic
 */
export const useAuthenticatedApi = () => {
  const { data: session, status } = useSession();

  // Check if session is authenticated and has an access token
  const isAuthenticated = status === 'authenticated' && !!session?.accessToken;
  const accessToken = session?.accessToken || null;

  return {
    accessToken,
    isAuthenticated,
    isLoading: status === 'loading',
  };
};
