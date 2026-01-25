'use client';

import { useCallback, useMemo } from 'react';

import { Card, CardContent, Chip, CircularProgress, FormControlLabel, Grid, Stack, Switch } from '@mui/material';

import InfoTooltip from '@/components/DataTable/InfoTooltipColumn/Tooltip';
import { DetailItem } from '@/components/DetailItem';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailTooltipWrapper } from '@/components/DetailTooltipWrapper';
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

import messages from './messages';

// Helper function to determine text color based on background luminance
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function VanDetail({ vanId }: { vanId: string }) {
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

  const vanDetailFields: { label: keyof typeof messages; value?: string | number | React.ReactNode }[] = useMemo(() => {
    return [
      {
        label: 'idLabel',
        value: van?.id,
      },
      {
        label: 'codeLabel',
        value: van?.code,
      },
      {
        label: 'nameLabel',
        value: van?.name,
      },
      {
        label: 'branchLabel',
        value: van?.branch?.name,
      },
      {
        label: 'colorNameLabel',
        value: van?.colorName,
      },
      {
        label: 'colorHexLabel',
        value: van?.colorHex ? (
          <Chip
            label={van.colorHex}
            size="small"
            sx={{
              backgroundColor: van.colorHex,
              color: getContrastColor(van.colorHex),
            }}
          />
        ) : (
          '-'
        ),
      },
      {
        label: 'areasLabel',
        value:
          van?.areas && van.areas.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {van.areas.map((area) => (
                <Chip key={area.id} label={area.name} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : (
            '-'
          ),
      },
    ];
  }, [van]);

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

  const handleCheck = useCallback(
    (checked: boolean) => {
      if (van) {
        if (checked) {
          handleActivate(van);
        } else handleDeactivate(van);
      }
    },
    [handleActivate, handleDeactivate, van],
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
      <Card>
        <CardContent>
          <DetailTooltipWrapper>
            <InfoTooltip
              createdAt={van?.createdAt}
              createdBy={van?.createdBy?.name}
              updatedAt={van?.updatedAt}
              updatedBy={van?.updatedBy?.name}
              isActive={van?.isActive}
            />
          </DetailTooltipWrapper>
          <Grid container spacing={2}>
            {vanDetailFields?.map((field, idx) => (
              <DetailItem
                key={`van-${idx}`}
                label={<FormattedMessage {...messages?.[field.label]} />}
                value={field.value}
              />
            ))}

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControlLabel
                control={
                  activateVan.isPending || deactivateVan.isPending || isFetching || isLoading ? (
                    <CircularProgress size={26} sx={{ mr: 2 }} />
                  ) : (
                    <Switch checked={van?.isActive || false} onChange={(e) => handleCheck(e.target.checked)} />
                  )
                }
                label={<FormattedMessage {...(van?.isActive ? messages.deactivate : messages.activate)} />}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
