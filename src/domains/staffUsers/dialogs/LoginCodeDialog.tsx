'use client';

import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { formatDateTime } from '@/domains/students/utils';

import { StaffUserEntity } from '@/providers/service/app.schemas';
import { staffUserControllerIssueLoginCode } from '@/providers/service/staff-user/staff-user';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useStaffActions } from '../hooks/useStaffActions';
import messages from '../messages';
import { formatLoginCode, ltr } from '../utils';

interface LoginCodeDialogProps {
  open: boolean;
  user: StaffUserEntity;
  onClose: () => void;
}

/**
 * Asks first, then issues a one-time login code and shows it once, large.
 * The code lives only in this component's state: it calls the API function directly (not a
 * React Query mutation, whose cache would keep the response), and forgets the code on close.
 */
export function LoginCodeDialog({ open, user, onClose }: LoginCodeDialogProps) {
  const { onSuccess, onError } = useStaffActions();
  const [issued, setIssued] = useState<{ code: string; expiresAt: string; staffId: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) setIssued(null);
  }, [open]);

  const handleClose = () => {
    setIssued(null);
    onClose();
  };

  const handleIssue = async () => {
    setPending(true);
    try {
      const res = await staffUserControllerIssueLoginCode(user.id);
      setIssued({ code: res.code, expiresAt: res.expiresAt, staffId: res.staffId });
      // Refresh the code state on the page; the code itself isn't part of it
      await onSuccess();
    } catch (error) {
      onError(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onClose={pending ? undefined : handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>
        {issued ? (
          <FormattedMessage {...messages.loginCode} />
        ) : (
          <FormattedMessage {...messages.loginCodeConfirmTitle} values={{ name: user.name }} />
        )}
      </DialogTitle>
      <DialogContent dividers>
        {issued ? (
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
            <Box
              aria-label="login code"
              dir="ltr"
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: 48, sm: 60 },
                fontWeight: 700,
                letterSpacing: '0.12em',
                lineHeight: 1.1,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                bgcolor: 'grey.100',
                userSelect: 'all',
              }}
            >
              {formatLoginCode(issued.code)}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              <FormattedMessage
                {...messages.loginCodeExpires}
                values={{ time: ltr(formatDateTime(issued.expiresAt)) }}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage {...messages.loginCodeHowTo} values={{ staffId: issued.staffId }} />
            </Typography>
            <Alert severity="warning" sx={{ textAlign: 'start' }}>
              <FormattedMessage {...messages.loginCodeShownOnce} values={{ name: user.name }} />
            </Alert>
          </Stack>
        ) : (
          <Typography variant="body2">
            <FormattedMessage {...messages.loginCodeConfirm} values={{ name: user.name }} />
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        {issued ? (
          <Button variant="contained" onClick={handleClose}>
            <FormattedMessage {...messages.done} />
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={pending}>
              <FormattedMessage {...messages.cancel} />
            </Button>
            <Button
              variant="contained"
              onClick={handleIssue}
              disabled={pending || !user.isActive}
              startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              <FormattedMessage {...messages.issue} />
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
