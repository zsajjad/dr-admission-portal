'use client';

import { useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  BulkUpsertResultsResponseDto,
  ResultPart,
  ResultPartInputDto,
  ResultSource,
} from '@/providers/service/app.schemas';
import { resultsControllerBulkUpsert } from '@/providers/service/results/results';
import { studentMergeControllerLookupGrs } from '@/providers/service/student-merge/student-merge';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';
import { parseLines } from '../utils';

const MAX_LINES = 2000; // the GR lookup's limit
const PARTS = [ResultPart.THEORY, ResultPart.ATTENDANCE] as const;

type Status = 'ok' | 'otherClass' | 'notFound' | 'noAdmission' | 'badMarks' | 'twice';

interface Row {
  line: number;
  gr: string;
  marks: string;
  status: Status;
  admissionId?: string;
  name?: string;
  currentGr?: string;
  classCode?: string;
  serverReason?: string;
}

const statusColor: Record<Status, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  otherClass: 'warning',
  notFound: 'error',
  noAdmission: 'error',
  badMarks: 'error',
  twice: 'error',
};

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  classLevelId: string;
  classLevelCode: string;
}

/**
 * Paste "GR, marks" from a sheet. GRs (old ones too) are looked up in one call, the rows are
 * checked with the server (dry run), and only then imported with POST /results/bulk-upsert.
 */
export function ImportDialog({ open, onClose, sessionId, classLevelId, classLevelCode }: ImportDialogProps) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const [part, setPart] = useState<(typeof PARTS)[number]>(ResultPart.THEORY);
  const [outOf, setOutOf] = useState('60');
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [checked, setChecked] = useState<BulkUpsertResultsResponseDto | null>(null);
  const [pending, setPending] = useState(false);
  const [touched, setTouched] = useState(false);

  const parsed = useMemo(() => parseLines(text), [text]);

  useEffect(() => {
    if (open) {
      setText('');
      setReason('');
      setTouched(false);
      setPart(ResultPart.THEORY);
      setOutOf('60');
    }
  }, [open]);

  // Anything edited after a check must be checked again
  useEffect(() => {
    setRows(null);
    setChecked(null);
  }, [text, part, outOf, sessionId]);

  const max = Number(outOf);
  const items: ResultPartInputDto[] = useMemo(
    () =>
      (rows || [])
        .filter((r) => r.status === 'ok' || r.status === 'otherClass')
        .map((r) => ({
          admissionId: r.admissionId!,
          part,
          source: ResultSource.PORTAL,
          sourceRef: `sheet line ${r.line}`,
          marks: Number(r.marks),
          maxMarks: max,
        })),
    [rows, part, max],
  );

  const check = async () => {
    setTouched(true);
    if (!reason.trim() || !max || max <= 0) return;
    setPending(true);
    try {
      const lookup = await studentMergeControllerLookupGrs({
        grNumbers: parsed.rows.map((r) => r.gr),
        sessionId,
      });
      const byGr = new Map(lookup.data.map((d) => [d.queriedGr, d]));
      const seen = new Set<string>();
      const next: Row[] = parsed.rows.map((r) => {
        const hit = byGr.get(r.gr.trim());
        const admission = hit?.admissions[0];
        const n = Number(r.marks);
        const row: Row = {
          ...r,
          status: 'ok',
          name: hit?.student?.name,
          currentGr: hit?.viaAlias ? hit.student?.grNumber : undefined,
          admissionId: admission?.id,
          classCode: admission?.classLevel.code,
        };
        if (!hit?.found) row.status = 'notFound';
        else if (!admission) row.status = 'noAdmission';
        else if (Number.isNaN(n) || n < 0 || n > max) row.status = 'badMarks';
        else if (seen.has(admission.id)) row.status = 'twice';
        else if (admission.classLevel.id !== classLevelId) row.status = 'otherClass';
        if (admission) seen.add(admission.id);
        return row;
      });
      const ready = next.filter((r) => r.status === 'ok' || r.status === 'otherClass');
      const dry = ready.length
        ? await resultsControllerBulkUpsert({
            items: ready.map((r) => ({
              admissionId: r.admissionId!,
              part,
              source: ResultSource.PORTAL,
              sourceRef: `sheet line ${r.line}`,
              marks: Number(r.marks),
              maxMarks: max,
            })),
            dryRun: true,
            reason: reason.trim(),
          })
        : null;
      // Show the server's reasons next to the rows it refused
      const refused = new Map((dry?.rejected || []).map((x) => [x.index, x.reason]));
      ready.forEach((r, i) => {
        r.serverReason = refused.get(i);
      });
      setRows(next);
      setChecked(dry);
    } catch (error) {
      show({ message: extractNetworkError(error) || intl.formatMessage(messages.failed), type: 'error' });
    } finally {
      setPending(false);
    }
  };

  const importNow = async () => {
    setPending(true);
    try {
      const res = await resultsControllerBulkUpsert({ items, dryRun: false, reason: reason.trim() });
      await queryClient.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/results'),
      });
      show({
        message: intl.formatMessage(messages.importResult, {
          created: res.items.created,
          updated: res.items.updated,
          unchanged: res.items.unchanged,
          rejected: res.rejected.length,
        }),
        type: res.rejected.length ? 'warning' : 'success',
      });
      onClose();
    } catch (error) {
      show({ message: extractNetworkError(error) || intl.formatMessage(messages.failed), type: 'error' });
    } finally {
      setPending(false);
    }
  };

  const tooMany = parsed.rows.length > MAX_LINES;
  const statusLabel = (r: Row) => {
    switch (r.status) {
      case 'otherClass':
        return intl.formatMessage(messages.rowOtherClass, { code: r.classCode ?? '?' });
      case 'notFound':
        return intl.formatMessage(messages.rowNotFound);
      case 'noAdmission':
        return intl.formatMessage(messages.rowNoAdmission);
      case 'badMarks':
        return intl.formatMessage(messages.rowBadMarks, { max: outOf });
      case 'twice':
        return intl.formatMessage(messages.rowTwice);
      default:
        return intl.formatMessage(messages.rowOk);
    }
  };

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600 }}>
        <FormattedMessage {...messages.importTitle} /> · {classLevelCode}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.importHint} />
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              size="small"
              sx={{ minWidth: 220 }}
              label={<FormattedMessage {...messages.importPart} />}
              value={part}
              onChange={(e) => setPart(e.target.value as (typeof PARTS)[number])}
            >
              {PARTS.map((p) => (
                <MenuItem key={p} value={p}>
                  <FormattedMessage {...messages[`part${p}`]} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              sx={{ width: 120 }}
              label={<FormattedMessage {...messages.outOf} />}
              value={outOf}
              onChange={(e) => setOutOf(e.target.value)}
              error={touched && (!max || max <= 0)}
            />
          </Stack>
          <TextField
            multiline
            minRows={6}
            maxRows={14}
            fullWidth
            label={<FormattedMessage {...messages.importLines} />}
            value={text}
            onChange={(e) => setText(e.target.value)}
            slotProps={{ htmlInput: { 'aria-label': 'sheet lines', style: { fontFamily: 'monospace' } } }}
          />
          {parsed.errors.length > 0 && (
            <Alert severity="warning">
              <FormattedMessage {...messages.unreadable} values={{ lines: parsed.errors.slice(0, 20).join(', ') }} />
            </Alert>
          )}
          {tooMany && (
            <Alert severity="error">
              <FormattedMessage {...messages.tooMany} values={{ max: String(MAX_LINES) }} />
            </Alert>
          )}
          <TextField
            size="small"
            fullWidth
            required
            label={<FormattedMessage {...messages.reasonRequired} />}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={touched && !reason.trim()}
            helperText={touched && !reason.trim() ? <FormattedMessage {...messages.reasonMissing} /> : undefined}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />

          {checked && (
            <Alert severity={checked.rejected.length ? 'warning' : 'success'}>
              <FormattedMessage
                {...messages.dryRunResult}
                values={{
                  created: String(checked.items.created),
                  updated: String(checked.items.updated),
                  unchanged: String(checked.items.unchanged),
                  rejected: String(checked.rejected.length),
                }}
              />
            </Alert>
          )}

          {rows && (
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage {...messages.colLine} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colGr} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colName} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colMarks} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colStatus} />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.line}>
                      <TableCell>{r.line}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {r.gr}
                        {r.currentGr && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            <FormattedMessage {...messages.rowOldGr} values={{ gr: r.currentGr }} />
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{r.name ?? '—'}</TableCell>
                      <TableCell>{r.marks}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={r.serverReason ? 'error' : statusColor[r.status]}
                          variant="outlined"
                          label={r.serverReason ?? statusLabel(r)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} disabled={pending}>
          <FormattedMessage {...messages.cancel} />
        </Button>
        <Button
          variant="outlined"
          onClick={check}
          disabled={pending || !parsed.rows.length || tooMany}
          startIcon={pending && !checked ? <CircularProgress size={16} /> : undefined}
        >
          <FormattedMessage {...messages.check} />
        </Button>
        <Button
          variant="contained"
          onClick={importNow}
          disabled={pending || !checked || !items.length}
          startIcon={pending && checked ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          <FormattedMessage {...messages.importNow} values={{ count: String(items.length) }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
