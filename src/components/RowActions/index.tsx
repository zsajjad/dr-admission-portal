import * as React from 'react';

import {
  CheckCircle as ActivateIcon,
  ChevronRight,
  Cancel as DeactivateIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Replay as RetryIcon,
} from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { stopPropagation } from '@/utils';

import messages from './messages';

export interface RowActionsProps {
  onEdit?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
  messageKeys?: {
    activate?: keyof typeof messages;
    deactivate?: keyof typeof messages;
    delete?: keyof typeof messages;
    view?: keyof typeof messages;
    edit?: keyof typeof messages;
    retry?: keyof typeof messages;
  };
  empty?: boolean;
}

export function RowActions({
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onView,
  onRetry,
  isLoading = false,
  messageKeys = {
    activate: 'activate',
    deactivate: 'deactivate',
    delete: 'delete',
    view: 'view',
    edit: 'edit',
    retry: 'retry',
  },
  empty,
}: RowActionsProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'flex-end' }}>
      {onEdit ? (
        <Tooltip title={<FormattedMessage {...messages[messageKeys.edit as keyof typeof messages]} />}>
          <IconButton size="small" onClick={stopPropagation(onEdit)} disabled={isLoading}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {onActivate ? (
        <Tooltip title={<FormattedMessage {...messages[messageKeys.deactivate as keyof typeof messages]} />}>
          <IconButton color="warning" size="small" onClick={stopPropagation(onActivate)} disabled={isLoading}>
            {isLoading ? <CircularProgress size={16} /> : <DeactivateIcon />}
          </IconButton>
        </Tooltip>
      ) : null}
      {onDeactivate ? (
        <Tooltip title={<FormattedMessage {...messages[messageKeys.activate as keyof typeof messages]} />}>
          <IconButton color="success" size="small" onClick={stopPropagation(onDeactivate)} disabled={isLoading}>
            {isLoading ? <CircularProgress size={16} /> : <ActivateIcon />}
          </IconButton>
        </Tooltip>
      ) : null}
      {onDelete ? (
        <Tooltip title={<FormattedMessage {...messages[messageKeys.delete as keyof typeof messages]} />}>
          <IconButton color="error" size="small" onClick={stopPropagation(onDelete)} disabled={isLoading}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {onView ? (
        <Tooltip title={<FormattedMessage {...messages[messageKeys.view as keyof typeof messages]} />}>
          <IconButton color="primary" size="small" onClick={stopPropagation(onView)} disabled={isLoading}>
            <ChevronRight />
          </IconButton>
        </Tooltip>
      ) : null}
      {onRetry ? (
        <Tooltip title={<FormattedMessage {...messages[messageKeys.retry as keyof typeof messages]} />}>
          <IconButton color="primary" size="small" onClick={stopPropagation(onRetry)} disabled={isLoading}>
            <RetryIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {empty && (
        <IconButton color="primary" size="small" disabled={isLoading}>
          -
        </IconButton>
      )}
    </Box>
  );
}
