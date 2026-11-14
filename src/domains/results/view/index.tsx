'use client';

import { useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import {
  EditNote as EnterIcon,
  EmojiEvents as RanksIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  UploadFile as ImportIcon,
} from '@mui/icons-material';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { useClassLevels, useSessionBranchFilters } from '@/domains/sections/hooks/useSectionData';
import { cardStyle } from '@/domains/students/utils';

import { BranchFilter } from '@/components/BranchFilter';
import { PageHeading } from '@/components/PageHeading';
import { SessionFilter } from '@/components/SessionFilter';

import { ClassResultRow, FinalResultStatus, Permission, ResultPart } from '@/providers/service/app.schemas';
import { resultsControllerEnterPart, useResultsControllerFindForClass } from '@/providers/service/results/results';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { usePermissions } from '@/hooks/usePermissions';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { RuleCard } from '../components/RuleCard';
import { ImportDialog } from '../dialogs/ImportDialog';
import { LockDialog } from '../dialogs/LockDialog';
import { RanksDialog } from '../dialogs/RanksDialog';
import messages from '../messages';
import { byPosition, fmt, inBatches, latestPart, pendingReason, resultColor } from '../utils';

const UNPLACED = '__none';

/**
 * The results of one class (session, branch and gendered class level): theory, Fiqh trainings,
 * attendance, pass or fail and position among passed students. Admins with the right permission
 * enter theory marks, import a sheet, lock results and work out positions.
 */
export function ResultsView() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();
  const { has } = usePermissions();
  const { sessionId, branchId } = useSessionBranchFilters();
  const { filters, setFilter } = useListingFilters<{ classLevelId?: string; section?: string }>();
  const { levels, byId } = useClassLevels();
  const classLevelId = filters.classLevelId;
  const ready = !!sessionId && !!branchId && !!classLevelId;

  const { data, isLoading, isError, error } = useResultsControllerFindForClass(
    { sessionId: sessionId ?? '', branchId: branchId ?? '', classLevelId: classLevelId ?? '' },
    { query: { enabled: ready } },
  );
  const passMark = data?.theoryPassMark ?? null;
  const trainingsConnected = (data?.data || []).some((r) => r.trainings);

  const canEnter = has(Permission.resultsenter, Permission.resultsoverride);
  const canOverride = has(Permission.resultsoverride);
  const canLock = has(Permission.resultslock);
  const canRank = has(Permission.resultslock, Permission.resultsoverride);

  const sections = useMemo(() => {
    const letters = new Map<string, string>();
    for (const r of data?.data || []) if (r.sectionId) letters.set(r.sectionId, r.sectionLetter ?? '?');
    return [...letters.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data?.data]);

  const rows = useMemo(() => {
    const all = (data?.data || []).filter((r) =>
      !filters.section ? true : filters.section === UNPLACED ? !r.sectionId : r.sectionId === filters.section,
    );
    return [...all].sort(byPosition);
  }, [data?.data, filters.section]);

  const counts = useMemo(() => {
    const c = { passed: 0, failed: 0, pending: 0 };
    for (const r of rows) {
      if (r.final?.result === FinalResultStatus.PASS) c.passed += 1;
      else if (r.final?.result === FinalResultStatus.FAIL) c.failed += 1;
      else if (!r.final?.result) c.pending += 1;
    }
    return c;
  }, [rows]);

  // Entering theory marks
  const [entering, setEntering] = useState(false);
  const [outOf, setOutOf] = useState('');
  const [reason, setReason] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<'import' | 'lock' | 'unlock' | 'ranks' | null>(null);

  useEffect(() => {
    setEntering(false);
    setMarks({});
  }, [sessionId, branchId, classLevelId]);

  const startEntering = () => {
    // Default "out of" to the most common maximum already entered in this class
    const maxes = new Map<number, number>();
    for (const r of data?.data || []) {
      const m = latestPart(r.parts, ResultPart.THEORY)?.maxMarks;
      if (m) maxes.set(m, (maxes.get(m) ?? 0) + 1);
    }
    const common = [...maxes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    setOutOf(common ? String(common) : '');
    setReason('');
    setMarks({});
    setEntering(true);
  };

  const max = Number(outOf);
  const changed = Object.entries(marks).filter(([, v]) => v.trim() !== '');
  const invalid = (v: string) => {
    const n = Number(v);
    return v.trim() !== '' && (!outOf || Number.isNaN(n) || n < 0 || n > max);
  };
  const anyInvalid = !outOf || Number.isNaN(max) || max <= 0 || changed.some(([, v]) => invalid(v));

  const saveMarks = async () => {
    setSaving(true);
    const results = await inBatches(changed, 4, ([admissionId, v]) =>
      resultsControllerEnterPart(admissionId, ResultPart.THEORY, {
        marks: Number(v),
        maxMarks: max,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }),
    );
    const failed = changed.filter((_, i) => results[i].status === 'rejected');
    await queryClient.invalidateQueries({
      predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/results'),
    });
    const saved = changed.length - failed.length;
    if (saved) show({ message: intl.formatMessage(messages.marksSaved, { count: saved }), type: 'success' });
    if (failed.length) {
      const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      show({
        message: `${intl.formatMessage(messages.marksFailed, { count: failed.length })} ${extractNetworkError(firstError?.reason) ?? ''}`,
        type: 'error',
      });
      setMarks(Object.fromEntries(failed));
    } else {
      setEntering(false);
      setMarks({});
    }
    setSaving(false);
  };

  const level = classLevelId ? byId.get(classLevelId) : undefined;

  return (
    <Stack>
      <PageHeading heading={messages.title} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1.5, mb: 2 }}
      >
        <SessionFilter minWidth={220} />
        <BranchFilter minWidth={200} />
        <TextField
          select
          size="small"
          sx={{ minWidth: 200 }}
          label={<FormattedMessage {...messages.classLevel} />}
          value={classLevelId ?? ''}
          onChange={(e) => setFilter({ classLevelId: e.target.value || undefined, section: undefined })}
        >
          {levels.map((l) => (
            <MenuItem key={l.id} value={l.id}>
              {l.code}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          sx={{ minWidth: 160 }}
          label={<FormattedMessage {...messages.section} />}
          value={filters.section ?? ''}
          disabled={!ready}
          onChange={(e) => setFilter({ section: e.target.value || undefined })}
        >
          <MenuItem value="">
            <FormattedMessage {...messages.allSections} />
          </MenuItem>
          {sections.map(([id, letter]) => (
            <MenuItem key={id} value={id}>
              <FormattedMessage {...messages.sectionLetter} values={{ letter }} />
            </MenuItem>
          ))}
          <MenuItem value={UNPLACED}>
            <FormattedMessage {...messages.notPlaced} />
          </MenuItem>
        </TextField>
      </Stack>

      {!ready ? (
        <Alert severity="info">
          <FormattedMessage {...messages.pickFilters} />
        </Alert>
      ) : (
        <>
          <RuleCard passMark={passMark} trainingsConnected={trainingsConnected} />

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {extractNetworkError(error) || <FormattedMessage {...messages.loadFailed} />}
            </Alert>
          )}

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ md: 'center' }}
            sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1, mb: 2 }}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              <FormattedMessage
                {...messages.summary}
                values={{
                  total: String(rows.length),
                  passed: String(counts.passed),
                  failed: String(counts.failed),
                  pending: String(counts.pending),
                }}
              />
            </Typography>
            {canEnter && !entering && (
              <Button size="small" startIcon={<EnterIcon />} onClick={startEntering} disabled={!rows.length}>
                <FormattedMessage {...messages.enterMarks} />
              </Button>
            )}
            {canOverride && (
              <Button size="small" startIcon={<ImportIcon />} onClick={() => setDialog('import')}>
                <FormattedMessage {...messages.import} />
              </Button>
            )}
            {canRank && (
              <Button size="small" startIcon={<RanksIcon />} onClick={() => setDialog('ranks')}>
                <FormattedMessage {...messages.computeRanks} />
              </Button>
            )}
            {canLock && (
              <>
                <Button size="small" startIcon={<LockIcon />} onClick={() => setDialog('lock')} disabled={!rows.length}>
                  <FormattedMessage {...messages.lock} />
                </Button>
                <Button
                  size="small"
                  startIcon={<UnlockIcon />}
                  onClick={() => setDialog('unlock')}
                  disabled={!rows.length}
                >
                  <FormattedMessage {...messages.unlock} />
                </Button>
              </>
            )}
          </Stack>

          {entering && (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ md: 'center' }}
              sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1.5, mb: 2 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                <FormattedMessage {...messages.entryHint} />
              </Typography>
              <TextField
                size="small"
                type="number"
                sx={{ width: 110 }}
                label={<FormattedMessage {...messages.outOf} />}
                value={outOf}
                onChange={(e) => setOutOf(e.target.value)}
                error={!outOf}
                slotProps={{ htmlInput: { min: 1, 'aria-label': 'out of' } }}
              />
              <TextField
                size="small"
                sx={{ minWidth: 260 }}
                label={<FormattedMessage {...messages.reasonOptional} />}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
              <Button onClick={() => setEntering(false)} disabled={saving}>
                <FormattedMessage {...messages.cancel} />
              </Button>
              <Button variant="contained" onClick={saveMarks} disabled={saving || !changed.length || anyInvalid}>
                <FormattedMessage {...messages.saveMarks} values={{ count: String(changed.length) }} />
              </Button>
            </Stack>
          )}

          {isLoading ? (
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
          ) : (
            <TableContainer sx={{ ...cardStyle, bgcolor: 'background.paper' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 150 }}>
                      <FormattedMessage {...messages.colPosition} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colGr} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colName} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colSection} />
                    </TableCell>
                    <TableCell sx={{ width: entering ? 140 : undefined }}>
                      <FormattedMessage {...messages.colTheory} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colTrainings} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colAttendance} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.colResult} />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          <FormattedMessage {...messages.noStudents} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((row) => (
                    <ResultRow
                      key={row.admissionId}
                      row={row}
                      passMark={passMark}
                      entering={entering}
                      canChangeLocked={canOverride}
                      value={marks[row.admissionId] ?? ''}
                      invalid={invalid(marks[row.admissionId] ?? '')}
                      max={outOf}
                      onChange={(v) => setMarks((m) => ({ ...m, [row.admissionId]: v }))}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {ready && (
        <>
          <ImportDialog
            open={dialog === 'import'}
            onClose={() => setDialog(null)}
            sessionId={sessionId!}
            classLevelId={classLevelId!}
            classLevelCode={level?.code ?? ''}
          />
          <LockDialog
            open={dialog === 'lock' || dialog === 'unlock'}
            locking={dialog === 'lock'}
            onClose={() => setDialog(null)}
            admissionIds={rows.map((r) => r.admissionId)}
            decided={rows.filter((r) => r.final).length}
          />
          <RanksDialog
            open={dialog === 'ranks'}
            onClose={() => setDialog(null)}
            sessionId={sessionId!}
            branchId={branchId!}
          />
        </>
      )}
    </Stack>
  );
}

interface ResultRowProps {
  row: ClassResultRow;
  passMark: number | null;
  entering: boolean;
  canChangeLocked: boolean;
  value: string;
  invalid: boolean;
  max: string;
  onChange: (value: string) => void;
}

function ResultRow({ row, passMark, entering, canChangeLocked, value, invalid, max, onChange }: ResultRowProps) {
  const intl = useIntl();
  const theory = latestPart(row.parts, ResultPart.THEORY);
  const attendance = latestPart(row.parts, ResultPart.ATTENDANCE);
  const final = row.final;
  const passed = final?.result === FinalResultStatus.PASS;
  const locked = !!final?.locked;
  const below = passMark !== null && theory?.marks !== null && theory?.marks !== undefined && theory.marks < passMark;

  return (
    <TableRow hover>
      <TableCell>
        {passed && final?.branchRank ? (
          <Stack direction="row" spacing={0.5} alignItems="baseline">
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {final.branchRank}
            </Typography>
            {final.rankedOf ? (
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage {...messages.positionOf} values={{ count: String(final.rankedOf) }} />
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <Typography color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{row.grNumber}</TableCell>
      <TableCell>{row.name}</TableCell>
      <TableCell>
        {row.sectionLetter ?? (
          <Typography variant="body2" color="text.disabled">
            <FormattedMessage {...messages.notPlaced} />
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {entering ? (
          <TextField
            size="small"
            type="number"
            value={value}
            placeholder={theory?.marks !== null && theory?.marks !== undefined ? fmt(theory.marks) : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={locked && !canChangeLocked}
            error={invalid}
            helperText={invalid ? intl.formatMessage(messages.badMarks, { max: max || '?' }) : undefined}
            slotProps={{ htmlInput: { min: 0, 'aria-label': `theory ${row.grNumber}` } }}
            sx={{ width: 110 }}
          />
        ) : theory && theory.marks !== null && theory.marks !== undefined ? (
          <Tooltip title={below ? intl.formatMessage(messages.belowPassMark) : ''}>
            <Typography variant="body2" color={below ? 'error.main' : undefined}>
              {fmt(theory.marks)}
              {theory.maxMarks ? ` / ${fmt(theory.maxMarks)}` : ''}
              {theory.scorePct !== null && theory.scorePct !== undefined && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {` · ${fmt(theory.scorePct)}%`}
                </Typography>
              )}
            </Typography>
          </Tooltip>
        ) : (
          <Typography color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell>
        {!row.trainings ? (
          <Typography variant="body2" color="text.disabled">
            <FormattedMessage {...messages.trainingsUnknown} />
          </Typography>
        ) : row.trainings.required === 0 ? (
          <Chip size="small" variant="outlined" label={<FormattedMessage {...messages.trainingsNone} />} />
        ) : row.trainings.complete ? (
          <Chip size="small" color="success" label={<FormattedMessage {...messages.trainingsComplete} />} />
        ) : (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={
              <FormattedMessage
                {...messages.trainingsPartial}
                values={{ passed: String(row.trainings.passed), required: String(row.trainings.required) }}
              />
            }
          />
        )}
      </TableCell>
      <TableCell>
        {attendance && attendance.marks !== null && attendance.marks !== undefined ? (
          `${fmt(attendance.marks)}${attendance.maxMarks ? ` / ${fmt(attendance.maxMarks)}` : ''}`
        ) : (
          <Typography color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {final?.result ? (
            <Chip
              size="small"
              color={resultColor[final.result]}
              label={<FormattedMessage {...messages[`result${final.result}`]} />}
            />
          ) : (
            <Tooltip title={intl.formatMessage(pendingReason(row, passMark))}>
              <Chip size="small" variant="outlined" label={<FormattedMessage {...messages.resultPending} />} />
            </Tooltip>
          )}
          {locked && (
            <Tooltip title={intl.formatMessage(messages.locked)}>
              <LockIcon fontSize="small" color="action" aria-label="locked" />
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
