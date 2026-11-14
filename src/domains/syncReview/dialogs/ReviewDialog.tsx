'use client';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { useStaffSyncReviewControllerReview } from '@/providers/service/staff-sync-review/staff-sync-review';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

interface ReviewDialogProps {
  open: boolean;
  ids: string[];
  /** true: mark reviewed; false: put back to review */
  reviewed: boolean;
  onClose: () => void;
  onDone: () => void;
}

export function ReviewDialog({ open, ids, reviewed, onClose, onDone }: ReviewDialogProps) {
  const mutation = useStaffSyncReviewControllerReview();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const intl = useIntl();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  const handleSubmit = () =>
    mutation.mutate(
      { data: { ids, reviewed, ...(reviewed && note.trim() ? { note: note.trim() } : {}) } },
      {
        onSuccess: async (res) => {
          await queryClient.invalidateQueries({
            predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/staff-sync-review'),
          });
          show({ message: intl.formatMessage(messages.done, { count: res.updated }), type: 'success' });
          onDone();
          onClose();
        },
        onError: (error) =>
          show({ message: extractNetworkError(error) || intl.formatMessage(messages.failed), type: 'error' }),
      },
    );

  return (
    <ProfileDialog
      open={open}
      title={
        <FormattedMessage
          {...(reviewed ? messages.reviewTitle : messages.reopenTitle)}
          values={{ count: String(ids.length) }}
        />
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      submitLabel={<FormattedMessage {...(reviewed ? messages.markReviewed : messages.backToReview)} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          <FormattedMessage {...messages.reviewExplain} />
        </Typography>
        {reviewed && (
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label={<FormattedMessage {...messages.noteOptional} />}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        )}
      </Stack>
    </ProfileDialog>
  );
}
