'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { PrinterError } from '@/utils/thermalPrinter';

import messages from './messages';

interface PrintErrorDialogProps {
  error: PrinterError | null;
  grNumber?: string;
  onRetry: () => void;
  onPrintInBrowser: () => void;
  onClose: () => void;
}

/** Explains why a slip didn't print and what to do, with Retry. */
export function PrintErrorDialog({ error, grNumber, onRetry, onPrintInBrowser, onClose }: PrintErrorDialogProps) {
  if (!error) return null;

  const explanation = messages[`error_${error.code}`] ?? messages.error_unknown;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {grNumber ? (
          <FormattedMessage {...messages.errorTitleFor} values={{ grNumber }} />
        ) : (
          <FormattedMessage {...messages.errorTitle} />
        )}
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          <FormattedMessage {...explanation} />
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <FormattedMessage {...messages.browserHint} />
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage {...messages.technicalDetail} values={{ detail: error.message }} />
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage {...messages.close} />
        </Button>
        <Button onClick={onPrintInBrowser}>
          <FormattedMessage {...messages.printInBrowser} />
        </Button>
        <Button variant="contained" onClick={onRetry} autoFocus>
          <FormattedMessage {...messages.retry} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
