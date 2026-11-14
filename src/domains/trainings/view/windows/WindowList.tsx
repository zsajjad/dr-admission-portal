'use client';

import { useEffect, useState } from 'react';

import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { SessionFilter } from '@/components/SessionFilter';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { TestingWindow, useCloseWindow, useWindows, windowStatus } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { useSessions } from '../../components/useCurrentSession';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatDateTime } from '../../utils';

import messages from './messages';
import { WindowDialog } from './WindowDialog';

const STATUS_COLOR = {
  SCHEDULED: 'info',
  OPEN: 'success',
  CLOSED: 'default',
  CLOSED_EARLY: 'warning',
} as const;

/** A session's testing windows; trainings.manage can open, edit and close them early */
export function WindowList() {
  const { canManage } = useTrainingsAccess();
  const notify = useNotify();
  const { filters, setFilter } = useListingFilters<{ sessionId?: string }>();
  const { current } = useSessions();
  const sessionId = filters.sessionId;

  // Start on the current session
  useEffect(() => {
    if (!sessionId && current) setFilter({ sessionId: current.id });
  }, [sessionId, current, setFilter]);

  const { data, isLoading, error } = useWindows({ sessionId, take: 200 });
  const close = useCloseWindow();
  const [dialog, setDialog] = useState<{ window?: TestingWindow } | null>(null);
  const [closing, setClosing] = useState<TestingWindow | null>(null);

  const windows = [...(data?.data ?? [])].sort((a, b) => b.opensAt.localeCompare(a.opensAt));

  const handleClose = () => {
    if (!closing) return;
    close.mutate(
      { id: closing.id },
      {
        onSuccess: () => {
          notify.success();
          setClosing(null);
        },
        onError: notify.error,
      },
    );
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
        <SessionFilter />
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({})} disabled={!sessionId}>
            <FormattedMessage {...messages.newWindow} />
          </Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.help} />
      </Typography>

      {error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}

      <Card sx={{ ...cardStyle, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage {...messages.name} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...common.branch} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.opensAt} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.closesAt} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.status} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.testers} />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage {...messages.graded} />
              </TableCell>
              {canManage && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {!sessionId && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    <FormattedMessage {...messages.pickSession} />
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {sessionId &&
              isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton height={28} />
                  </TableCell>
                </TableRow>
              ))}
            {sessionId && !isLoading && windows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    <FormattedMessage {...messages.noWindows} />
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {windows.map((w) => {
              const status = windowStatus(w);
              const ended = status === 'CLOSED' || status === 'CLOSED_EARLY';
              return (
                <TableRow key={w.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{w.name}</TableCell>
                  <TableCell>{w.branch?.name ?? <FormattedMessage {...common.allBranches} />}</TableCell>
                  <TableCell>{formatDateTime(w.opensAt)}</TableCell>
                  <TableCell>
                    {formatDateTime(w.closesAt)}
                    {status === 'CLOSED_EARLY' && (
                      <Typography variant="caption" color="warning.dark" sx={{ display: 'block' }}>
                        <FormattedMessage {...messages.closedAt} values={{ at: formatDateTime(w.closedAt) }} />
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={STATUS_COLOR[status]}
                      label={<FormattedMessage {...messages[status]} />}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    {w.testers.length ? (
                      w.testers.map((t) => t.name).join(', ')
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage {...messages.everyTester} />
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{w.gradedCount ?? '--'}</TableCell>
                  {canManage && (
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" onClick={() => setDialog({ window: w })}>
                        <FormattedMessage {...common.edit} />
                      </Button>
                      {!ended && (
                        <Button size="small" color="warning" onClick={() => setClosing(w)}>
                          <FormattedMessage {...messages.closeNow} />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {canManage && (
        <WindowDialog
          open={!!dialog}
          window={dialog?.window}
          defaultSessionId={sessionId}
          onClose={() => setDialog(null)}
        />
      )}
      <ActionDialog
        open={!!closing}
        title={<FormattedMessage {...messages.closeConfirmTitle} values={{ name: closing?.name ?? '' }} />}
        onClose={() => setClosing(null)}
        onSubmit={handleClose}
        isSubmitting={close.isPending}
        submitLabel={<FormattedMessage {...messages.closeNow} />}
        submitColor="warning"
        maxWidth="xs"
      >
        <Typography>
          <FormattedMessage {...messages.closeConfirm} />
        </Typography>
      </ActionDialog>
    </Stack>
  );
}
