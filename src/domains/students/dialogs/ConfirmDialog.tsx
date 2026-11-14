import { ReactNode } from 'react';

import { Typography } from '@mui/material';

import { ProfileDialog } from './ProfileDialog';

interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  message: ReactNode;
  confirmLabel: ReactNode;
  confirmColor?: 'primary' | 'success' | 'warning' | 'error';
  isSubmitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ message, confirmLabel, onConfirm, ...rest }: ConfirmDialogProps) {
  return (
    <ProfileDialog
      {...rest}
      onSubmit={onConfirm}
      submitLabel={confirmLabel}
      submitColor={rest.confirmColor}
      maxWidth="xs"
    >
      <Typography variant="body2">{message}</Typography>
    </ProfileDialog>
  );
}
