'use client';

import { Box, Chip, Stack } from '@mui/material';

import { DetailHeader } from '@/components/DetailHeader';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { KEYS } from '@/providers/constants/key';
import { Van } from '@/providers/service/app.schemas';
import {
  useVanControllerActivate,
  useVanControllerDeactivate,
  useVanControllerFindOne,
} from '@/providers/service/van/van';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import messages from './messages';

export function VanDetail({ vanId }: { vanId: string }) {
  const { route } = useQueryParams();
  const activateVan = useVanControllerActivate();
  const deactivateVan = useVanControllerDeactivate();
  const {
    data: { data: van } = {},
    isLoading,
    isFetching,
    error,
  } = useVanControllerFindOne(
    vanId,
    {
      includeInActive: true,
    },
    {
      query: {
        queryKey: [KEYS.VAN_DETAIL, vanId],
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
    queryKey: [KEYS.VAN_DETAIL, vanId],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<Van>(
    activateVan,
    deactivateVan,
    onSuccess,
    onError,
  );

  useEntityDetailHandler({
    data: van,
    isLoading: isLoading || isFetching,
    notFoundMessage: formattedMessages.failToFetch,
    isEnabled: true,
    // @ts-expect-error error type is unknown
    error: error?.statusCode,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!van) {
    return <DetailNotFound notFoundMessage={formattedMessages.notFound} />;
  }

  return (
    <Stack spacing={2}>
      <DetailHeader
        mark={van.code}
        markColor={van.colorHex || undefined}
        title={van.name}
        isActive={van.isActive}
        fields={[
          { key: 'code', label: <FormattedMessage {...messages.codeLabel} />, value: van.code, dir: 'ltr' },
          { key: 'branch', label: <FormattedMessage {...messages.branchLabel} />, value: van.branch?.name },
          {
            key: 'color',
            label: <FormattedMessage {...messages.colorNameLabel} />,
            value: van.colorName ? (
              <Stack direction="row" spacing={1} alignItems="center">
                {van.colorHex ? (
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: van.colorHex,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ) : null}
                <span>{van.colorName}</span>
              </Stack>
            ) : undefined,
          },
          {
            key: 'areas',
            label: <FormattedMessage {...messages.areasLabel} />,
            value:
              van.areas && van.areas.length > 0 ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {van.areas.map((area) => (
                    <Chip key={area.id} label={area.name} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : undefined,
          },
        ]}
        createdAt={van.createdAt}
        createdBy={van.createdBy?.name}
        updatedAt={van.updatedAt}
        updatedBy={van.updatedBy?.name}
        onEdit={() => route({ url: routes.van.edit(van.id) })}
        onToggleActive={() => (van.isActive ? handleDeactivate(van) : handleActivate(van))}
        isToggling={activateVan.isPending || deactivateVan.isPending || isFetching}
      />
    </Stack>
  );
}
