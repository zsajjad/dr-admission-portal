'use client';

import React, { PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { signOut } from 'next-auth/react';

import { routes } from '@/router/routes';

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  response?: {
    statusCode: number;
    message: string;
  };
}
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && ('statusCode' in error || 'response' in error);
}
export function ReactQueryRegistry({ children }: PropsWithChildren<object>) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode: 'always',
            refetchOnReconnect: true,
            retry: 2,

            throwOnError: (error) => {
              if (isApiError(error)) {
                const status = error.statusCode ?? error.response?.statusCode;
                if (status === 401) {
                  signOut({ redirect: true, callbackUrl: routes.auth.signIn });
                }
              }
              return false;
            },
          },
          mutations: {
            networkMode: 'always',
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
