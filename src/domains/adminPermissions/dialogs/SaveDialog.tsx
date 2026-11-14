'use client';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { Chip, Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import {
  adminPermissionControllerGrant,
  adminPermissionControllerRevoke,
} from '@/providers/service/admin-permission/admin-permission';
import { AdminUserWithPermissions, Permission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';
import { permissionMessages } from '../permissionGroups';

interface SaveDialogProps {
  open: boolean;
  user: AdminUserWithPermissions;
  toGrant: string[];
  toRevoke: string[];
  onClose: () => void;
}

/** Confirm the changes with a reason; grants and removals are sent separately, each audited by core. */
export function SaveDialog({ open, user, toGrant, toRevoke, onClose }: SaveDialogProps) {
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

  const label = (code: string) => {
    const known = permissionMessages(code);
    return known ? intl.formatMessage(known.name) : code;
  };

  const submit = async () => {
    setTouched(true);
    const why = reason.trim();
    if (!why) return;
    setPending(true);
    try {
      if (toGrant.length) {
        await adminPermissionControllerGrant(user.adminUserId, { permissions: toGrant as Permission[], reason: why });
      }
      if (toRevoke.length) {
        await adminPermissionControllerRevoke(user.adminUserId, {
          permissions: toRevoke as Permission[],
          reason: why,
        });
      }
      show({ message: intl.formatMessage(messages.saved), type: 'success' });
      onClose();
    } catch (error) {
      show({ message: extractNetworkError(error) || intl.formatMessage(messages.saveFailed), type: 'error' });
    } finally {
      // A grant may have gone through before a revoke failed: always show what core has now
      await queryClient.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/admin-permission'),
      });
      setPending(false);
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.saveTitle} values={{ name: user.name }} />}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={pending}
      submitLabel={<FormattedMessage {...messages.save} />}
    >
      <Stack spacing={2}>
        {toGrant.length > 0 && (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">
              <FormattedMessage {...messages.granting} />
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {toGrant.map((code) => (
                <Chip key={code} size="small" color="success" label={label(code)} />
              ))}
            </Stack>
          </Stack>
        )}
        {toRevoke.length > 0 && (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">
              <FormattedMessage {...messages.removing} />
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {toRevoke.map((code) => (
                <Chip key={code} size="small" color="error" label={label(code)} />
              ))}
            </Stack>
          </Stack>
        )}
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          required
          label={<FormattedMessage {...messages.reason} />}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={touched && !reason.trim()}
          helperText={touched && !reason.trim() ? <FormattedMessage {...messages.reasonRequired} /> : undefined}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </Stack>
    </ProfileDialog>
  );
}
