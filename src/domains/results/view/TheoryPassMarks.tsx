'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { SessionFilter } from '@/components/SessionFilter';

import { Permission } from '@/providers/service/app.schemas';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { usePermissions } from '@/hooks/usePermissions';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { useSaveTheoryPassMarks, useTheoryPassMarks } from '../api';
import messages from '../messages';

const MARKS = /^\d+(\.\d{1,2})?$/;

/** Theory pass marks per class level for a session; saving recomputes the session's results */
export function TheoryPassMarks() {
  const intl = useIntl();
  const { show } = useSnackbarContext();
  const { has, isLoading: permsLoading } = usePermissions();
  const canRead = has(Permission.reportsview, Permission.resultslock);
  const canEdit = has(Permission.resultslock);
  const { filters, setFilter } = useListingFilters<{ sessionId?: string }>();
  const { data: sessionsData } = useSessionControllerFindAll({ take: 100 });
  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData]);
  const sessionId = filters.sessionId as string | undefined;
  const session = sessions.find((s) => s.id === sessionId);

  useEffect(() => {
    if (!sessionId && sessions.length) setFilter({ sessionId: (sessions.find((s) => s.isActive) ?? sessions[0]).id });
  }, [sessionId, sessions, setFilter]);

  const { data: levelsData, isLoading: levelsLoading } = useClassLevelControllerFindAll({ take: 100 });
  const levels = useMemo(
    () => [...(levelsData?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code)),
    [levelsData],
  );
  const { data: marks, isLoading, error } = useTheoryPassMarks(canRead ? sessionId : undefined);
  const save = useSaveTheoryPassMarks();

  const [values, setValues] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const initial = useMemo(
    () =>
      Object.fromEntries((marks ?? []).map((m) => [m.classLevelId, m.passMarks === null ? '' : String(m.passMarks)])),
    [marks],
  );
  useEffect(() => setValues(initial), [initial]);

  const invalid = Object.values(values).some((v) => v.trim() !== '' && !MARKS.test(v.trim()));
  const dirty = levels.some((l) => (values[l.id] ?? '') !== (initial[l.id] ?? ''));

  if (permsLoading) return <Skeleton variant="rounded" height={160} />;
  if (!canRead) {
    return (
      <Alert severity="warning">
        <FormattedMessage {...messages.notAllowed} />
      </Alert>
    );
  }

  const handleSave = () => {
    if (!sessionId) return;
    save.save(
      {
        sessionId,
        // Only changed rows; an emptied row sends null, which removes its pass mark
        rows: levels
          .filter((l) => (values[l.id] ?? '') !== (initial[l.id] ?? ''))
          .map((l) => ({
            classLevelId: l.id,
            passMarks: (values[l.id] ?? '').trim() === '' ? null : Number(values[l.id]),
          })),
      },
      {
        onSuccess: () => {
          setConfirm(false);
          show({ message: intl.formatMessage(messages.saved), type: 'success' });
        },
        onError: (err) => show({ message: extractNetworkError(err), type: 'error' }),
      },
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.help} />
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <SessionFilter />
        {dirty && <Chip size="small" color="warning" label={<FormattedMessage {...messages.unsaved} />} />}
      </Stack>
      {!canEdit && (
        <Alert severity="info">
          <FormattedMessage {...messages.readOnly} />
        </Alert>
      )}
      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...messages.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <CardContent>
          {isLoading || levelsLoading ? (
            <Skeleton variant="rounded" height={240} />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage {...messages.classLevel} />
                  </TableCell>
                  <TableCell sx={{ width: 200 }}>
                    <FormattedMessage {...messages.passMarks} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levels.map((l) => {
                  const v = values[l.id] ?? '';
                  const bad = v.trim() !== '' && !MARKS.test(v.trim());
                  return (
                    <TableRow key={l.id}>
                      <TableCell>
                        {l.name}{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          ({l.code})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={v}
                          disabled={!canEdit}
                          error={bad}
                          helperText={bad ? intl.formatMessage(messages.invalid) : undefined}
                          onChange={(e) => setValues((x) => ({ ...x, [l.id]: e.target.value }))}
                          slotProps={{ htmlInput: { inputMode: 'decimal', dir: 'ltr', 'aria-label': l.code } }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {canEdit && (
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" disabled={!dirty || invalid || !sessionId} onClick={() => setConfirm(true)}>
            <FormattedMessage {...messages.save} />
          </Button>
        </Stack>
      )}
      <Dialog open={confirm} onClose={() => !save.isPending && setConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          <FormattedMessage {...messages.confirmTitle} />
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning">
            <FormattedMessage {...messages.confirm} values={{ session: session?.name ?? '' }} />
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)} disabled={save.isPending}>
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleSave}
            disabled={save.isPending}
            startIcon={save.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
