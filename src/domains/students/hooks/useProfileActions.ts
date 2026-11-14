import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/providers/constants/key';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

export const studentProfileKey = (studentId: string) => [KEYS.STUDENT_PROFILE, studentId];

/**
 * Shared success/error handling for every edit made from the profile:
 * refetch the profile (and admission lists), then show a snackbar.
 */
export function useProfileActions(studentId: string) {
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const saved = useFormattedMessage(messages.saved);
  const saveFailed = useFormattedMessage(messages.saveFailed);

  const onSuccess = useCallback(
    async (message?: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentProfileKey(studentId) }),
        queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_LISTING] }),
        queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_DETAIL] }),
        queryClient.invalidateQueries({ queryKey: [KEYS.STUDENT_LISTING] }),
      ]);
      show({ message: message || saved, type: 'success' });
    },
    [queryClient, show, studentId, saved],
  );

  const onError = useCallback(
    (error: unknown) => {
      show({ message: extractNetworkError(error) || saveFailed, type: 'error' });
    },
    [show, saveFailed],
  );

  return { onSuccess, onError };
}
