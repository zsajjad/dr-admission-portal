'use client';

import { Stack } from '@mui/material';

import { DetailHeader } from '@/components/DetailHeader';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { KEYS } from '@/providers/constants/key';
import { Branch } from '@/providers/service/app.schemas';
import {
  useBranchControllerActivate,
  useBranchControllerDeactivate,
  useBranchControllerFindOne,
} from '@/providers/service/branch/branch';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import messages from './messages';

export function BranchDetail({ branchId }: { branchId: string }) {
  const { route } = useQueryParams();
  const activateBranch = useBranchControllerActivate();
  const deactivateBranch = useBranchControllerDeactivate();
  const {
    data: { data: branch } = {},
    isLoading,
    isFetching,
    error,
  } = useBranchControllerFindOne(
    branchId,
    {
      includeInActive: true,
    },
    {
      query: {
        queryKey: [KEYS.BRANCH_DETAIL, branchId],
      },
    },
  );

  const formattedMessages = {
    failToFetch: useFormattedMessage(messages.failToFetch),
    notFound: useFormattedMessage(messages.notFound),
    activate: useFormattedMessage(messages.activate),
    deActivate: useFormattedMessage(messages.deactivate),
    successUpdate: useFormattedMessage(messages.successUpdate),
    errorUpdate: useFormattedMessage(messages.errorUpdate),
  };

  const { onSuccess, onError } = useMutationHandlers({
    queryKey: [KEYS.BRANCH_DETAIL, branchId],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<Branch>(
    activateBranch,
    deactivateBranch,
    onSuccess,
    onError,
  );

  useEntityDetailHandler({
    data: branch,
    isLoading: isLoading || isFetching,
    notFoundMessage: formattedMessages.failToFetch,
    isEnabled: true,
    // @ts-expect-error error type is unknown
    error: error?.statusCode,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!branch) {
    return <DetailNotFound notFoundMessage={formattedMessages.notFound} />;
  }

  return (
    <Stack spacing={2}>
      <DetailHeader
        mark={branch.code}
        title={branch.name}
        isActive={branch.isActive}
        fields={[{ key: 'code', label: <FormattedMessage {...messages.codeLabel} />, value: branch.code, dir: 'ltr' }]}
        createdAt={branch.createdAt}
        createdBy={branch.createdBy?.name}
        updatedAt={branch.updatedAt}
        updatedBy={branch.updatedBy?.name}
        onEdit={() => route({ url: routes.branches.edit(branch.id) })}
        onToggleActive={() => (branch.isActive ? handleDeactivate(branch) : handleActivate(branch))}
        isToggling={activateBranch.isPending || deactivateBranch.isPending || isFetching}
      />
    </Stack>
  );
}
