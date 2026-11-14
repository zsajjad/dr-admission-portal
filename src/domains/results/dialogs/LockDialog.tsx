'use client';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { resultsControllerLock, resultsControllerUnlock } from '@/providers/service/results/results';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';

interface LockDialogProps {
  open: boolean;
  locking: boolean;
  onClose: () => void;
  /** The students shown (the class, or one section of it) */
  admissionIds: string[];
  /** How many of them have a final result to lock */
  decided: number;
}

/** Lock or unlock the results shown, with a reason for the audit log. */
export function LockDialog({ open, locking, onClose, admissionIds, decided }: LockDialogProps) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  const submit = async () => {
    setTouched(true);
    if (!reason.trim()) return;
    setPending(true);
    try {
      const body = { admissionIds, reason: reason.trim() };
      const res = locking ? await resultsControllerLock(body) : await resultsControllerUnlock(body);
      await queryClient.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/results'),
      });
      show({
        message: intl.formatMessage(locking ? messages.lockDone : messages.unlockDone, { count: res.count }),
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
      title={<FormattedMessage {...(locking ? messages.lockTitle : messages.unlockTitle)} />}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={pending}
      submitColor={locking ? 'warning' : 'primary'}
      submitLabel={<FormattedMessage {...(locking ? messages.lock : messages.unlock)} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          <FormattedMessage {...(locking ? messages.lockExplain : messages.unlockExplain)} />
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          <FormattedMessage {...messages.lockScope} values={{ count: String(admissionIds.length) }} />
        </Typography>
        {decided < admissionIds.length && (
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage {...messages.lockScopeNote} />
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          required
          label={<FormattedMessage {...messages.reasonRequired} />}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={touched && !reason.trim()}
          helperText={touched && !reason.trim() ? <FormattedMessage {...messages.reasonMissing} /> : undefined}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </Stack>
    </ProfileDialog>
  );
}
