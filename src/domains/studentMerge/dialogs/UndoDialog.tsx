'use client';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { StudentMergeEntity } from '@/providers/service/app.schemas';
import { studentMergeControllerUndo } from '@/providers/service/student-merge/student-merge';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

interface UndoDialogProps {
  merge: StudentMergeEntity | null;
  onClose: () => void;
}

/** Undo a merge (or link, backfill) with a reason; core refuses when a later change depends on it. */
export function UndoDialog({ merge, onClose }: UndoDialogProps) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setReason('');
    setTouched(false);
  }, [merge]);

  const submit = async () => {
    setTouched(true);
    if (!merge || !reason.trim()) return;
    setPending(true);
    try {
      await studentMergeControllerUndo(merge.id, { reason: reason.trim() });
      await queryClient.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === 'string' &&
          (q.queryKey[0].startsWith('/admin/students') || q.queryKey[0].startsWith('/students')),
      });
      show({ message: intl.formatMessage(messages.undoDone), type: 'success' });
      onClose();
    } catch (error) {
      show({ message: extractNetworkError(error) || intl.formatMessage(messages.failed), type: 'error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <ProfileDialog
      open={!!merge}
      title={<FormattedMessage {...messages.undoTitle} />}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={pending}
      submitColor="warning"
      submitLabel={<FormattedMessage {...messages.undo} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          <FormattedMessage {...messages.undoExplain} />
        </Typography>
        {merge && (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {merge.survivorGrNumber} ← {merge.mergedGrNumbers.join(', ')}
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          required
          label={<FormattedMessage {...messages.undoReason} />}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={touched && !reason.trim()}
          helperText={touched && !reason.trim() ? <FormattedMessage {...messages.reasonMissing} /> : undefined}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
        />
      </Stack>
    </ProfileDialog>
  );
}
