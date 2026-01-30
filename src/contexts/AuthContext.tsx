'use client';

import React, { createContext, useCallback, useContext, useEffect } from 'react';

import { signOut as nextAuthSignOut, signIn as nextAuthSignIn, useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';

import {
  useAdminAuthControllerGetAdminDetails,
  useAdminAuthControllerLogout,
} from '@/providers/service/admin-auth/admin-auth';
import { AdminUser } from '@/providers/service/app.schemas';

import OverlayLoader from '@/theme/Loader';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { config } from '@/config';
import {
  getAuthenticationToken,
  removeAuthenticationHeader,
  setAuthenticationHeader,
  setRefreshToken,
} from '@/services';

import { useSnackbarContext } from './SnackbarContext';

interface AuthContextProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user?: AdminUser;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (values: { email: string; password: string; captchaToken?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider: React.FC<AuthContextProps> = ({ children }) => {
  const { data: session, status, update: updateSession } = useSession();
  const adminLogout = useAdminAuthControllerLogout();

  const snackbar = useSnackbarContext();
  const router = useRouter();

  const { data: user, isLoading } = useAdminAuthControllerGetAdminDetails({ query: { enabled: !!session } });

  const previousToken = getAuthenticationToken();
  const currentToken = session?.accessToken;
  const currentRefreshToken = session?.refreshToken;

  if (currentToken && previousToken !== `Bearer ${currentToken}`) {
    setAuthenticationHeader(currentToken);
  }

  // Set refresh token for automatic token refresh
  if (currentRefreshToken) {
    setRefreshToken(currentRefreshToken);
  }

  const signOut = async (): Promise<void> => {
    // Implement sign out logic here, e.g., clear session, redirect, etc.
    try {
      adminLogout.mutateAsync(undefined, {
        onSuccess: async () => {
          // Clear authentication header
          removeAuthenticationHeader();
          sessionStorage.removeItem('isTabActive');
          await nextAuthSignOut({ redirect: true, callbackUrl: routes.auth.signIn });
          snackbar.show({
            message: 'You have been signed out! please login to continue',
            type: 'success',
          });
        },
        onError: (error) => {
          snackbar.show({
            message: extractNetworkError(error) || 'Failed to sign out',
            type: 'error',
          });
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signIn = useCallback(
    async (values: { email: string; password: string; captchaToken?: string }): Promise<void> => {
      try {
        const loginResponse = await nextAuthSignIn(config.site.id, {
          redirect: false,
          username: values.email,
          password: values.password,
          captchaToken: values.captchaToken ?? '',
          callbackUrl: routes.home,
        });

        if (loginResponse?.ok && loginResponse.status === 200 && !loginResponse.error) {
          router.push(routes.home);
          sessionStorage.setItem('isTabActive', 'true');
          snackbar.show({ message: 'Login successful', type: 'success' });
        } else if (loginResponse?.code === 'credentials') {
          snackbar.show({
            message: 'Invalid username or password',
            type: 'error',
          });
        } else if (loginResponse?.error && loginResponse.status === 401) {
          snackbar.show({
            message: 'Invalid credentials! Please check your credentials.',
            type: 'error',
          });
        } else {
          snackbar.show({
            message: extractNetworkError(loginResponse?.error) || 'Login failed. Please try again.',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Sign in error:', error);
        snackbar.show({
          message: 'An unexpected error occurred. Please try again.',
          type: 'error',
        });
      }
    },
    [router, snackbar],
  );

  // Listen for token refresh events and update the NextAuth session
  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ accessToken: string; refreshToken: string }>;
      const { accessToken, refreshToken } = customEvent.detail;
      // Update the NextAuth session with new tokens using the update function
      updateSession({ accessToken, refreshToken }).catch((err) => {
        console.error('Failed to update session:', err);
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      }
    };
  }, [updateSession]);

  useEffect(() => {
    // Set tab as active when session is available
    if (session && typeof window !== 'undefined') {
      sessionStorage.setItem('isTabActive', 'true');
    }
    if (session && session.requiresPasswordChange) {
      router.push(routes.auth.createPassword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user: user?.data,
        isAuthenticated: status === 'authenticated',
        loading: isLoading || status === 'loading' || adminLogout.isPending,
      }}
    >
      {status === 'loading' ? <OverlayLoader /> : null}
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return context;
};

const AuthContextConsumer = AuthContext.Consumer;

export { AuthContextProvider, AuthContextConsumer, AuthContext, useAuthContext };
