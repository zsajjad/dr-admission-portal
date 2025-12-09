import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { messages } from '../message';

interface AssetDeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function AssetDeleteConfirmation({ open, onClose, onDelete }: AssetDeleteConfirmationProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage {...messages.deleteConfirmationTitle} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormattedMessage {...messages.deleteConfirmationMessage} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage {...messages.deleteConfirmationCancel} />
        </Button>
        <Button onClick={onDelete}>
          <FormattedMessage {...messages.deleteConfirmationDelete} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
