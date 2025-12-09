import { useCallback } from 'react';

type ActivationMutation<TId extends string | number = string> = {
  mutate: (
    variables: { id: TId },
    options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    },
  ) => void;
};

/**
 * Hook to handle single-record activation/deactivation
 */
export const useActivationHandlers = <T extends { id: string | number }, TId extends string | number = string>(
  activateMutation: ActivationMutation<TId>,
  deactivateMutation: ActivationMutation<TId>,
  onSuccess: () => void,
  onError: (error: unknown) => void,
) => {
  const handleActivate = useCallback(
    (row: T) => {
      activateMutation.mutate({ id: row.id as TId }, { onSuccess, onError });
    },
    [activateMutation, onSuccess, onError],
  );

  const handleDeactivate = useCallback(
    (row: T) => {
      deactivateMutation.mutate({ id: row.id as TId }, { onSuccess, onError });
    },
    [deactivateMutation, onSuccess, onError],
  );

  return { handleActivate, handleDeactivate };
};
