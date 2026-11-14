'use client';

import Link from 'next/link';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { formatDateTime } from '@/domains/students/utils';

import { JsonViewer } from '@/components/JsonViewer';

import { AuditLogEntry } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import messages from '../messages';
import { changedFields, show } from '../utils';

import { ActorLabel } from './ActorLabel';

interface EntryDialogProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

/** One audit entry: who, what, why, the fields that changed, the full values and the chain hashes. */
export function EntryDialog({ entry, onClose }: EntryDialogProps) {
  if (!entry) return null;
  const changes = changedFields(entry.before, entry.after);
  const label = (m: (typeof messages)[keyof typeof messages]) => (
    <Typography variant="caption" color="text.secondary" display="block">
      <FormattedMessage {...m} />
    </Typography>
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600 }}>
        <FormattedMessage {...messages.detailTitle} values={{ seq: String(entry.seq) }} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {label(messages.colWhen)}
            <Typography variant="body2">{formatDateTime(entry.createdAt)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {label(messages.colWho)}
            <ActorLabel entry={entry} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {label(messages.colAction)}
            <Chip size="small" variant="outlined" label={entry.action} sx={{ fontFamily: 'monospace' }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {label(messages.colRecord)}
            <Typography variant="body2">
              {entry.entityType}{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                {entry.entityId}
              </Box>
            </Typography>
            <Button
              size="small"
              component={Link}
              href={routes.auditLog.record(entry.entityType, entry.entityId)}
              onClick={onClose}
              sx={{ px: 0 }}
            >
              <FormattedMessage {...messages.sameRecord} />
            </Button>
          </Grid>
          <Grid size={12}>
            {label(messages.reason)}
            <Typography variant="body2" color={entry.reason ? undefined : 'text.disabled'}>
              {entry.reason || <FormattedMessage {...messages.noReason} />}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              <FormattedMessage {...messages.changed} />
            </Typography>
            {changes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.noChanges} />
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage {...messages.field} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.before} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.after} />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {changes.map((c) => (
                    <TableRow key={c.field}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{c.field}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word', color: 'error.main' }}>{show(c.before)}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word', color: 'success.main' }}>{show(c.after)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Grid>

          {(entry.before !== undefined || entry.after !== undefined) && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                {label(messages.fullBefore)}
                <JsonViewer src={(entry.before as object) ?? {}} collapsed={false} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {label(messages.fullAfter)}
                <JsonViewer src={(entry.after as object) ?? {}} collapsed={false} />
              </Grid>
            </>
          )}

          <Grid size={12}>
            <Stack spacing={0.5}>
              {entry.ip && (
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage {...messages.ip} />: {entry.ip}
                </Typography>
              )}
              {entry.staffDeviceId && (
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage {...messages.device} />: {entry.staffDeviceId}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                <FormattedMessage {...messages.hash} />: <code>{entry.hash}</code>
              </Typography>
              {entry.prevHash && (
                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  <FormattedMessage {...messages.prevHash} />: <code>{entry.prevHash}</code>
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose}>
          <FormattedMessage {...messages.close} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
