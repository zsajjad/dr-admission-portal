import { FormEvent, ReactNode } from 'react';

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

interface ProfileDialogProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: ReactNode;
  submitColor?: 'primary' | 'success' | 'warning' | 'error';
  maxWidth?: 'xs' | 'sm' | 'md';
  children: ReactNode;
}

/** Dialog shell used by every edit on the profile */
export function ProfileDialog({
  open,
  title,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
  submitColor = 'primary',
  maxWidth = 'sm',
  children,
}: ProfileDialogProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth={maxWidth}>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={submitColor}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitLabel ?? <FormattedMessage {...messages.save} />}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
