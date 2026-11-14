'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import { Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { StaffUserEntity } from '@/providers/service/app.schemas';
import {
  useStaffUserControllerActivate,
  useStaffUserControllerDeactivate,
} from '@/providers/service/staff-user/staff-user';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useStaffActions } from '../hooks/useStaffActions';
import messages from '../messages';

interface ActivationDialogProps {
  open: boolean;
  user: StaffUserEntity;
  onClose: () => void;
}

/** Deactivate an active user (which logs out every phone) or reactivate a deactivated one */
export function ActivationDialog({ open, user, onClose }: ActivationDialogProps) {
  const deactivate = useStaffUserControllerDeactivate();
  const activate = useStaffUserControllerActivate();
  const { onSuccess, onError } = useStaffActions();
  const intl = useIntl();
  const [reason, setReason] = useState('');
  const [discardUnsent, setDiscardUnsent] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setDiscardUnsent(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (user.isActive) {
      deactivate.mutate(
        { id: user.id, data: { discardUnsent, ...(reason.trim() ? { reason: reason.trim() } : {}) } },
        {
          onSuccess: async (res) => {
            await onSuccess(
              res.revoked > 0 ? intl.formatMessage(messages.loggedOut, { count: res.revoked }) : undefined,
            );
            onClose();
          },
          onError,
        },
      );
    } else {
      activate.mutate(
        { id: user.id },
        {
          onSuccess: async () => {
            await onSuccess();
            onClose();
          },
          onError,
        },
      );
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={
        <FormattedMessage
          {...(user.isActive ? messages.deactivateTitle : messages.reactivateTitle)}
          values={{ name: user.name }}
        />
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={deactivate.isPending || activate.isPending}
      submitLabel={<FormattedMessage {...(user.isActive ? messages.deactivate : messages.reactivate)} />}
      submitColor={user.isActive ? 'error' : 'primary'}
      maxWidth="sm"
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          <FormattedMessage {...(user.isActive ? messages.deactivateExplain : messages.reactivateExplain)} />
        </Typography>
        {user.isActive && (
          <>
            <FormControlLabel
              control={<Checkbox checked={discardUnsent} onChange={(e) => setDiscardUnsent(e.target.checked)} />}
              label={<FormattedMessage {...messages.deactivateDiscard} />}
            />
            <TextField
              size="small"
              fullWidth
              label={<FormattedMessage {...messages.reasonOptional} />}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </>
        )}
      </Stack>
    </ProfileDialog>
  );
}
