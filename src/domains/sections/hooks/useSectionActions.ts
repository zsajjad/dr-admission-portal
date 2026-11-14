import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/providers/constants/key';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

const isSectionQuery = (key: readonly unknown[]) =>
  typeof key[0] === 'string' && (key[0].startsWith('/section') || key[0] === 'sections-all');

/** Shared success and error handling for section changes: refetch sections and admissions */
export function useSectionActions() {
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const saved = useFormattedMessage(messages.saved);
  const saveFailed = useFormattedMessage(messages.saveFailed);

  const onSuccess = useCallback(
    async (message?: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: (q) => isSectionQuery(q.queryKey) }),
        queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_LISTING] }),
        queryClient.invalidateQueries({ queryKey: [KEYS.STUDENT_PROFILE] }),
      ]);
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
