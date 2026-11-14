import { useCallback } from 'react';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

/** Snackbar messages for trainings mutations: the API's message on error (it explains refusals) */
export function useNotify() {
  const { show } = useSnackbarContext();
  const saved = useFormattedMessage(messages.saved);
  const saveFailed = useFormattedMessage(messages.saveFailed);

  const success = useCallback(
    (message?: string) => show({ message: message || saved, type: 'success' }),
    [show, saved],
  );
  const error = useCallback(
    (err: unknown) => {
      // Nest validation errors come as a list; extractNetworkError joins them with commas
      show({ message: extractNetworkError(err) || saveFailed, type: 'error' });
    },
    [show, saveFailed],
  );
  return { success, error };
}
