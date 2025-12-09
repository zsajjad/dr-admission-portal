import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { useQueryParams } from '@/router/useQueryParams';

interface UseEntityDetailHandlerProps {
  data: unknown;
  isLoading: boolean;
  notFoundMessage?: string;
  redirectTo?: string;
  isEnabled?: boolean;
  error?: number;
  removeParams?: string[];
}

export function useEntityDetailHandler({
  data,
  isLoading,
  notFoundMessage = 'Record not found',
  redirectTo,
  isEnabled,
  error,
  removeParams,
}: UseEntityDetailHandlerProps) {
  const router = useRouter();
  const hasHandledRef = useRef(false);
  const { deleteParams } = useQueryParams();
  const { show: showSnackbar } = useSnackbarContext();

  useEffect(() => {
    if (error === 404 && !isLoading && data) {
      router.back();
    }
    if (!isEnabled || hasHandledRef.current || isLoading) return;
    if (data) return;

    hasHandledRef.current = true;
    showSnackbar({
      message: notFoundMessage,
      type: 'error',
    });
    if (!!removeParams?.length) {
      deleteParams(removeParams);
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.back();
    }
  }, [
    isLoading,
    data,
    notFoundMessage,
    redirectTo,
    router,
    showSnackbar,
    error,
    isEnabled,
    removeParams,
    deleteParams,
  ]);
}
