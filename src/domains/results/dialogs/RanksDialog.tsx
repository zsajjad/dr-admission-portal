'use client';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { resultsControllerComputeRanks } from '@/providers/service/results/results';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

interface RanksDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  branchId: string;
}

/** Work out positions for the session and branch (core ranks each gendered class separately). */
export function RanksDialog({ open, onClose, sessionId, branchId }: RanksDialogProps) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    try {
      const res = await resultsControllerComputeRanks({ sessionId, branchId });
      await queryClient.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/results'),
      });
      show({
        message: intl.formatMessage(messages.ranksDone, {
          groups: res.groups,
          ranked: res.ranked,
          changed: res.changed,
        }),
        type: 'success',
      });
      onClose();
    } catch (error) {
      show({ message: extractNetworkError(error) || intl.formatMessage(messages.failed), type: 'error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.ranksTitle} />}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={pending}
      submitLabel={<FormattedMessage {...messages.computeRanks} />}
    >
      <Typography variant="body2">
        <FormattedMessage {...messages.ranksExplain} />
      </Typography>
    </ProfileDialog>
  );
}
