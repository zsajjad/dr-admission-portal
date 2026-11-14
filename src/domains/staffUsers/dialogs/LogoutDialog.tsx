'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import { Alert, Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { StaffDeviceEntity, StaffLogoutResponseDto, StaffUserEntity } from '@/providers/service/app.schemas';
import {
  useStaffUserControllerLogout,
  useStaffUserControllerRevokeDevice,
} from '@/providers/service/staff-user/staff-user';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useStaffActions } from '../hooks/useStaffActions';
import messages from '../messages';

interface LogoutDialogProps {
  open: boolean;
  user: StaffUserEntity;
  /** One phone; leave out for all of the user's phones */
  device?: StaffDeviceEntity;
  /** Lost or stolen phone: no drain token, unsent work is lost */
  discardUnsent: boolean;
  onClose: () => void;
}

/** Log out one phone or all of them, keeping or discarding the work they haven't sent */
export function LogoutDialog({ open, user, device, discardUnsent, onClose }: LogoutDialogProps) {
  const logoutAll = useStaffUserControllerLogout();
  const revokeOne = useStaffUserControllerRevokeDevice();
  const { onSuccess, onError } = useStaffActions();
  const intl = useIntl();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const done = async (res: StaffLogoutResponseDto) => {
    await onSuccess(
      res.discarded > 0
        ? intl.formatMessage(messages.loggedOutDiscarded, { count: res.revoked, discarded: res.discarded })
        : intl.formatMessage(messages.loggedOut, { count: res.revoked }),
    );
    onClose();
  };

  const handleSubmit = () => {
    const data = { discardUnsent, ...(reason.trim() ? { reason: reason.trim() } : {}) };
    if (device) {
      revokeOne.mutate({ id: user.id, deviceId: device.id, data }, { onSuccess: done, onError });
    } else {
      logoutAll.mutate({ id: user.id, data }, { onSuccess: done, onError });
    }
  };

  const title = device
    ? discardUnsent
      ? messages.discardTitleOne
      : messages.logoutTitleOne
    : discardUnsent
      ? messages.discardTitleAll
      : messages.logoutTitleAll;

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...title} values={{ name: user.name, phone: device?.label ?? '' }} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={logoutAll.isPending || revokeOne.isPending}
      submitLabel={<FormattedMessage {...(discardUnsent ? messages.logOutDiscard : messages.logOut)} />}
      submitColor={discardUnsent ? 'error' : 'warning'}
      maxWidth="sm"
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          <FormattedMessage {...(discardUnsent ? messages.discardExplain : messages.logoutExplain)} />
        </Typography>
        {discardUnsent && (
          <Alert severity="error">
            <FormattedMessage {...messages.discardWarning} />
          </Alert>
        )}
        <TextField
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.reasonOptional} />}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Stack>
    </ProfileDialog>
  );
}
