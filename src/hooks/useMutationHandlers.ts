import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

/**
 * Messages shown after mutation.
 */
export interface MutationMessages {
  successUpdate: string;
  errorUpdate: string;
}

interface MutationHandlersOptions {
  queryKey?: unknown[];
  supportQueryKey?: unknown[];
  messages: MutationMessages;
  setSubmitting?: (isSubmitting: boolean) => void;
  setStatus?: (message: string) => void;
  redirectTo?: string;
  isCreateMode?: boolean;
  removeParams?: string[];
  refetch?: boolean;
}

/**
 * Hook to get reusable mutation handlers (onSuccess, onError)
 */
export const useMutationHandlers = ({
  queryKey,
  supportQueryKey,
  messages,
  setStatus,
  redirectTo,
  removeParams,
  setSubmitting,
}: MutationHandlersOptions) => {
  const queryClient = useQueryClient();
  const { show: showSnackbar } = useSnackbarContext();
  const { route, deleteParams } = useQueryParams();

  const onSuccess = useCallback(async () => {
    setSubmitting?.(false);

    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey });
    }
    if (supportQueryKey) {
      await queryClient.invalidateQueries({ queryKey: supportQueryKey });
    }

    showSnackbar({
      message: messages.successUpdate,
      type: 'success',
    });

    if (redirectTo) {
      route({ url: redirectTo });
    }
    if (removeParams) {
      deleteParams(removeParams);
    }
  }, [
    setSubmitting,
    queryKey,
    supportQueryKey,
    showSnackbar,
    messages.successUpdate,
    redirectTo,
    removeParams,
    queryClient,
    route,
    deleteParams,
  ]);

  const onError = useCallback(
    (error: unknown) => {
      setSubmitting?.(false);
      const msg = extractNetworkError(error) || messages.errorUpdate || 'Something went wrong';

      setStatus?.(msg);

      showSnackbar({
        message: msg,
        type: 'error',
      });
    },
    [messages.errorUpdate, setStatus, setSubmitting, showSnackbar],
  );

  return { onSuccess, onError };
};
