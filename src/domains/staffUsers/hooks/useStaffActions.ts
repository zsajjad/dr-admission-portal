import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

/** Refetch every staff user query (list, detail, cards) */
export const isStaffUserQuery = (key: readonly unknown[]) =>
  typeof key[0] === 'string' && (key[0].startsWith('/staff-user') || key[0] === 'staff-users-all');

/** Shared success and error handling for staff user changes */
export function useStaffActions() {
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const saved = useFormattedMessage(messages.saved);
  const saveFailed = useFormattedMessage(messages.saveFailed);

  const onSuccess = useCallback(
    async (message?: string) => {
      await queryClient.invalidateQueries({ predicate: (q) => isStaffUserQuery(q.queryKey) });
      show({ message: message || saved, type: 'success' });
    },
    [queryClient, show, saved],
  );

  const onError = useCallback(
    (error: unknown) => show({ message: extractNetworkError(error) || saveFailed, type: 'error' }),
    [show, saveFailed],
  );

  return { onSuccess, onError };
}
