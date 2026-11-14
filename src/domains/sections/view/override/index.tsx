'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { FactCheck as DryRunIcon, PlaylistAddCheck as ApplyIcon, Search as LookUpIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { SectionCard } from '@/domains/students/components/SectionCard';
import { cardStyle } from '@/domains/students/utils';

import { PageHeading } from '@/components/PageHeading';
import { SessionFilter } from '@/components/SessionFilter';

import { BulkClassLevelOverrideResponseDto, ClassLevel } from '@/providers/service/app.schemas';
import { sectionControllerBulkOverrideClassLevel } from '@/providers/service/section/section';
import { studentMergeControllerLookupGrs } from '@/providers/service/student-merge/student-merge';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { useSectionActions } from '../../hooks/useSectionActions';
import { useClassLevels, useSessionBranchFilters } from '../../hooks/useSectionData';
import messages from '../../messages';

const MAX_ROWS = 2000; // the limit of the bulk class change and the GR lookup

type Outcome = 'change' | 'same' | 'notFound' | 'badClass' | 'otherGender' | 'twice';

interface Row {
  line: number;
  grNumber: string;
  classCode: string;
  admissionId?: string;
  name?: string;
  current?: string;
  target?: ClassLevel;
  outcome?: Outcome;
  serverReason?: string;
}

const outcomeMessage: Record<Outcome, (typeof messages)[keyof typeof messages]> = {
  change: messages.outcomeChange,
  same: messages.outcomeSame,
  notFound: messages.outcomeNotFound,
  badClass: messages.outcomeBadClass,
  otherGender: messages.outcomeOtherGender,
  twice: messages.outcomeTwice,
};
const outcomeColor: Record<Outcome, 'success' | 'default' | 'error' | 'warning'> = {
  change: 'success',
  same: 'default',
  notFound: 'error',
  badClass: 'error',
  otherGender: 'error',
  twice: 'warning',
};

/** "GR, class" per line; commas, tabs (pasted from a sheet) or semicolons. A header row is skipped. */
function parse(text: string): { rows: Row[]; errors: number[] } {
  const rows: Row[] = [];
  const errors: number[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const [gr, code] = line.split(/[\t,;]+|\s{2,}/).map((s) => s.trim());
    if (i === 0 && gr && !/\d/.test(gr)) return; // header
    if (!gr || !code) errors.push(i + 1);
    else rows.push({ line: i + 1, grNumber: gr, classCode: code });
  });
  return { rows, errors };
}

/**
 * Change the class of many students at once with POST /section/admissions/class-level/bulk.
 * Look the students up first to see what would change, check with the server (dry run),
 * then apply. Apply is only offered for the exact rows that were checked.
 */
export function ClassOverrideView() {
  const intl = useIntl();
  const { sessionId } = useSessionBranchFilters();
  const { byCode } = useClassLevels();
  const { onSuccess, onError } = useSectionActions();

  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [checked, setChecked] = useState<{ key: string; result: BulkClassLevelOverrideResponseDto } | null>(null);
  const [applied, setApplied] = useState<BulkClassLevelOverrideResponseDto | null>(null);
  const [pending, setPending] = useState(false);

  const parsed = useMemo(() => parse(text), [text]);

  // Anything edited after a look-up or a check has to be looked up and checked again
  useEffect(() => {
    setRows(null);
    setChecked(null);
    setApplied(null);
  }, [text, sessionId]);

  const items = useMemo(
    () =>
      (rows || [])
        .filter((r) => r.outcome === 'change' || r.outcome === 'same')
        .map((r) => ({ admissionId: r.admissionId!, classLevelId: r.target!.id })),
    [rows],
  );
  const itemsKey = JSON.stringify([items, reason.trim()]);

  const counts = useMemo(() => {
    const c = { change: 0, same: 0, bad: 0 };
    for (const r of rows || []) {
      if (r.outcome === 'change') c.change += 1;
      else if (r.outcome === 'same') c.same += 1;
      else c.bad += 1;
    }
    return c;
  }, [rows]);

  const lookUp = async () => {
    if (!sessionId) return;
    const list = parsed.rows.map((r) => ({ ...r }));
    setProgress({ done: 0, total: list.length });
    const found = new Map<
      string,
      { admissionId: string; name: string; current: string; currentId: string; gender: string } | null
    >();
    try {
      // One call for every GR (old GRs too), with each student's admission in this session
      const res = await studentMergeControllerLookupGrs({
        grNumbers: [...new Set(list.map((r) => r.grNumber))],
        sessionId,
      });
      for (const row of res.data) {
        const a = row.admissions.length === 1 ? row.admissions[0] : undefined;
        found.set(
          row.queriedGr,
          a && row.student
            ? {
                admissionId: a.id,
                name: row.student.name,
                current: a.classLevel.code,
                currentId: a.classLevel.id,
                gender: a.classLevel.gender,
              }
            : null,
        );
      }
      setProgress({ done: list.length, total: list.length });
    } catch (error) {
      onError(error);
      setProgress(null);
      return;
    }
    const seen = new Set<string>();
    for (const r of list) {
      const a = found.get(r.grNumber);
      const target = byCode.get(r.classCode);
      if (a) {
        r.admissionId = a.admissionId;
        r.name = a.name;
        r.current = a.current;
      }
      r.target = target;
      if (!a) r.outcome = 'notFound';
      else if (seen.has(a.admissionId)) r.outcome = 'twice';
      else if (!target) r.outcome = 'badClass';
      else if (target.gender !== a.gender) r.outcome = 'otherGender';
      else r.outcome = target.id === a.currentId ? 'same' : 'change';
      if (a) seen.add(a.admissionId);
    }
    setRows(list);
    setProgress(null);
  };

  const send = async (dryRun: boolean) => {
    setPending(true);
    try {
      const result = await sectionControllerBulkOverrideClassLevel({
        items,
        dryRun,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      // Show the server's reasons next to the rows it refused
      const refused = new Map(result.rejected.map((r) => [r.index, r.reason]));
      let k = 0;
      setRows((rs) =>
        (rs || []).map((r) => {
          if (r.outcome !== 'change' && r.outcome !== 'same') return r;
          const reasonText = refused.get(k);
          k += 1;
          return { ...r, serverReason: reasonText };
        }),
      );
      if (dryRun) setChecked({ key: itemsKey, result });
      else {
        setApplied(result);
        setChecked(null);
        await onSuccess(
          intl.formatMessage(messages.applyResult, {
            overridden: result.overridden,
            sectionCleared: result.sectionCleared,
            unchanged: result.unchanged,
            rejected: result.rejected.length,
          }),
        );
      }
    } catch (error) {
      onError(error);
    } finally {
      setPending(false);
    }
  };

  const checkedNow = checked?.key === itemsKey ? checked.result : null;
  const tooMany = parsed.rows.length > MAX_ROWS;

  return (
    <Stack spacing={2}>
      <PageHeading heading={messages.overrideTitle} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2 }}
      >
        <SessionFilter />
        <Box sx={{ flex: 1 }} />
        <Button component={Link} href={routes.sections.listing}>
          <FormattedMessage {...messages.overviewTitle} />
        </Button>
      </Stack>

      <SectionCard title={<FormattedMessage {...messages.overrideRows} />}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.overrideIntro} />
          </Typography>
          <TextField
            multiline
            minRows={6}
            maxRows={16}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'9221-0-0001-123456, Muhibaan5-G\n9221-1-0001-123457, Tiflan2-B'}
            slotProps={{ htmlInput: { dir: 'ltr', style: { fontFamily: 'monospace' } } }}
          />
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage {...messages.overrideClassCodes} values={{ codes: [...byCode.keys()].join(', ') }} />
          </Typography>
          {parsed.errors.length > 0 && (
            <Alert severity="warning">
              {parsed.errors.slice(0, 5).map((line) => (
                <div key={line}>
                  <FormattedMessage {...messages.overrideParseError} values={{ row: String(line) }} />
                </div>
              ))}
            </Alert>
          )}
          {tooMany && (
            <Alert severity="error">
              <FormattedMessage {...messages.overrideTooMany} values={{ max: String(MAX_ROWS) }} />
            </Alert>
          )}
          <TextField
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.overrideReason} />}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<LookUpIcon />}
              disabled={!sessionId || !parsed.rows.length || tooMany || !!progress}
              onClick={lookUp}
            >
              <FormattedMessage {...messages.overrideLookUp} />
            </Button>
            <Button
              variant="outlined"
              startIcon={pending ? <CircularProgress size={16} /> : <DryRunIcon />}
              disabled={!items.length || pending}
              onClick={() => send(true)}
            >
              <FormattedMessage {...messages.overrideDryRun} />
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<ApplyIcon />}
              disabled={!checkedNow || !checkedNow.overridden || pending}
              onClick={() => send(false)}
            >
              <FormattedMessage {...messages.overrideApply} values={{ count: String(checkedNow?.overridden ?? 0) }} />
            </Button>
          </Stack>
          {!sessionId && (
            <Alert severity="info">
              <FormattedMessage {...messages.overrideSessionFirst} />
            </Alert>
          )}
          {progress && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage
                  {...messages.overrideLookingUp}
                  values={{ done: String(progress.done), total: String(progress.total) }}
                />
              </Typography>
              <LinearProgress variant="determinate" value={(progress.done / Math.max(progress.total, 1)) * 100} />
            </Box>
          )}
          {checked && !checkedNow && (
            <Alert severity="warning">
              <FormattedMessage {...messages.editedSinceCheck} />
            </Alert>
          )}
          {checkedNow && (
            <Alert severity={checkedNow.rejected.length ? 'warning' : 'info'}>
              <FormattedMessage
                {...messages.dryRunResult}
                values={{
                  total: String(items.length),
                  overridden: String(checkedNow.overridden),
                  sectionCleared: String(checkedNow.sectionCleared),
                  unchanged: String(checkedNow.unchanged),
                  rejected: String(checkedNow.rejected.length),
                }}
              />
            </Alert>
          )}
          {applied && (
            <Alert severity="success">
              <FormattedMessage
                {...messages.applyResult}
                values={{
                  overridden: String(applied.overridden),
                  sectionCleared: String(applied.sectionCleared),
                  unchanged: String(applied.unchanged),
                  rejected: String(applied.rejected.length),
                }}
              />
            </Alert>
          )}
        </Stack>
      </SectionCard>

      {rows && (
        <SectionCard
          title={<FormattedMessage {...messages.colOutcome} />}
          summary={
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage
                {...messages.summaryLine}
                values={{ change: String(counts.change), same: String(counts.same), bad: String(counts.bad) }}
              />
            </Typography>
          }
        >
          <Box sx={{ overflowX: 'auto', maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage {...messages.colRow} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...messages.grNumber} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...messages.name} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...messages.colCurrent} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...messages.colNew} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...messages.colOutcome} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.line}>
                    <TableCell>{r.line}</TableCell>
                    <TableCell dir="ltr" sx={{ fontFamily: 'monospace' }}>
                      {r.grNumber}
                    </TableCell>
                    <TableCell>{r.name ?? '—'}</TableCell>
                    <TableCell>{r.current ?? '—'}</TableCell>
                    <TableCell>{r.target?.code ?? r.classCode}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={r.serverReason ? 'error' : outcomeColor[r.outcome!]}
                        label={
                          r.serverReason ? (
                            <FormattedMessage {...messages.rejectedBy} values={{ reason: r.serverReason }} />
                          ) : (
                            <FormattedMessage {...outcomeMessage[r.outcome!]} />
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </SectionCard>
      )}
    </Stack>
  );
}
