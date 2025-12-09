'use client';

import { useCallback, useMemo } from 'react';

import { Card, CardContent, CircularProgress, FormControlLabel, Grid, Stack, Switch } from '@mui/material';

import InfoTooltip from '@/components/DataTable/InfoTooltipColumn/Tooltip';
import { DetailItem } from '@/components/DetailItem';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailTooltipWrapper } from '@/components/DetailTooltipWrapper';
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

import messages from './messages';

export function BranchDetail({ branchId }: { branchId: string }) {
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

  const branchDetailFields: { label: keyof typeof messages; value?: string | number }[] = useMemo(() => {
    return [
      {
        label: 'idLabel',
        value: branch?.id,
      },
      {
        label: 'codeLabel',
        value: branch?.code,
      },
      {
        label: 'nameLabel',
        value: branch?.name,
      },
    ];
  }, [branch]);

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

  const handleCheck = useCallback(
    (checked: boolean) => {
      if (branch) {
        if (checked) {
          handleActivate(branch);
        } else handleDeactivate(branch);
      }
    },
    [handleActivate, handleDeactivate, branch],
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
      <Card>
        <CardContent>
          <DetailTooltipWrapper>
            <InfoTooltip
              createdAt={branch?.createdAt}
              createdBy={branch?.createdBy?.name}
              updatedAt={branch?.updatedAt}
              updatedBy={branch?.updatedBy?.name}
              isActive={branch?.isActive}
            />
          </DetailTooltipWrapper>
          <Grid container spacing={2}>
            {branchDetailFields?.map((field, idx) => (
              <DetailItem
                key={`branch-${idx}`}
                label={<FormattedMessage {...messages?.[field.label]} />}
                value={field.value}
              />
            ))}

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControlLabel
                control={
                  activateBranch.isPending || deactivateBranch.isPending || isFetching || isLoading ? (
                    <CircularProgress size={26} sx={{ mr: 2 }} />
                  ) : (
                    <Switch checked={branch?.isActive || false} onChange={(e) => handleCheck(e.target.checked)} />
                  )
                }
                label={<FormattedMessage {...(branch?.isActive ? messages.deactivate : messages.activate)} />}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
