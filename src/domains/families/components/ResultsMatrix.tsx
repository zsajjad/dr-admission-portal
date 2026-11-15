'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { useRouter } from 'next/navigation';

import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import studentMessages from '@/domains/students/messages';

import { routes } from '@/router/routes';

import { ChildAdmission, ChildSessions, SessionColumn } from '../api';
import messages from '../messages';
import { firstName, ageOn, partBand, pctOf, resultBand, ResultBand } from '../rules';

type Metric = 'total' | 'theory' | 'wazu' | 'namaz' | 'attendance';

const METRICS: Metric[] = ['total', 'theory', 'wazu', 'namaz', 'attendance'];

const METRIC_LABEL = {
  total: messages.metricTotal,
  theory: messages.metricTheory,
  wazu: messages.metricWazu,
  namaz: messages.metricNamaz,
  attendance: messages.metricAttendance,
};

/** Tints; none is the brand green, and the number and word are always printed too */
const TINT: Record<ResultBand, string | undefined> = {
  HIGH: 'rgba(var(--mui-palette-success-mainChannel) / 0.24)',
  GOOD: 'rgba(var(--mui-palette-success-mainChannel) / 0.12)',
  LOW: 'var(--mui-palette-brand-goldSoft)',
  FAIL: 'rgba(var(--mui-palette-error-mainChannel) / 0.12)',
  TERMINATED: 'var(--mui-palette-grey-100)',
  NO_RESULT: undefined,
  NOT_ADMITTED: undefined,
};

export interface MatrixChild {
  child: ChildSessions;
  /** When they left the household: a muted name, and blank cells after it */
  leftAt?: string;
}

const CELL_WIDTH = 112;

function Cell({
  admission,
  metric,
  resultsVisible,
  leftBefore,
}: {
  admission?: ChildAdmission;
  metric: Metric;
  resultsVisible: boolean;
  leftBefore: boolean;
}) {
  const intl = useIntl();
  if (!admission || leftBefore) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        {intl.formatMessage(messages.dot)}
      </Typography>
    );
  }
  const r = admission.result;
  const classLine = (
    <Typography variant="caption" color="text.secondary" component="div" noWrap title={admission.classLevel.name}>
      {admission.classLevel.name}
      {admission.sectionLetter ? ` ${admission.sectionLetter}` : ''}
    </Typography>
  );
  if (!resultsVisible) return classLine;

  let band: ResultBand;
  let text: string;
  let rank: string | null = null;
  if (metric === 'total') {
    band = resultBand({ admitted: true, status: r?.status, pct: r?.pct });
    const pct = r?.pct !== null && r?.pct !== undefined ? `${r.pct}%` : '';
    text =
      band === 'FAIL'
        ? intl.formatMessage(messages.failShort, { pct: pct || '--' })
        : band === 'TERMINATED'
          ? intl.formatMessage(messages.terminated)
          : band === 'NO_RESULT'
            ? intl.formatMessage(messages.noResult)
            : `${intl.formatMessage(studentMessages.resultPASS)} · ${pct}`;
    if (r?.branchRank) {
      rank = intl.formatMessage(messages.rankOf, { rank: String(r.branchRank), of: String(r.rankedOf ?? '?') });
    }
  } else if (metric === 'attendance') {
    const days = admission.attendanceDays;
    const total = admission.attendanceTotal;
    band = partBand(pctOf(days, total));
    text =
      days === null || days === undefined || !total
        ? intl.formatMessage(messages.dot)
        : intl.formatMessage(messages.daysOf, { days: String(days), total: String(total) });
  } else {
    const pct = metric === 'theory' ? r?.theoryPct : metric === 'wazu' ? r?.wazuPct : r?.namazPct;
    band = partBand(pct);
    text = pct === null || pct === undefined ? intl.formatMessage(messages.dot) : `${Math.round(pct)}%`;
  }

  const tip = r
    ? [
        r.total !== null && r.total !== undefined
          ? intl.formatMessage(messages.tipTotal, { total: String(r.total), max: String(r.maxTotal ?? '?') })
          : null,
        r.theoryPct !== null && r.theoryPct !== undefined
          ? `${intl.formatMessage(messages.metricTheory)} ${Math.round(r.theoryPct)}%`
          : null,
        r.wazuPct !== null && r.wazuPct !== undefined
          ? `${intl.formatMessage(messages.metricWazu)} ${Math.round(r.wazuPct)}%`
          : null,
        r.namazPct !== null && r.namazPct !== undefined
          ? `${intl.formatMessage(messages.metricNamaz)} ${Math.round(r.namazPct)}%`
          : null,
        admission.attendanceTotal
          ? intl.formatMessage(messages.tipAttendance, {
              days: String(admission.attendanceDays ?? 0),
              total: String(admission.attendanceTotal),
            })
          : null,
        r.locked ? intl.formatMessage(messages.tipLocked) : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const body = (
    <Stack spacing={0.25}>
      {classLine}
      <Box
        sx={{
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          bgcolor: TINT[band],
          fontWeight: band === 'NO_RESULT' ? 400 : 600,
          color: band === 'NO_RESULT' ? 'text.secondary' : 'text.primary',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </Box>
      {rank && (
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {rank}
        </Typography>
      )}
    </Stack>
  );
  return tip ? (
    <Tooltip title={tip} disableInteractive>
      {body}
    </Tooltip>
  ) : (
    body
  );
}

/**
 * Results by session (UX spec, screen 3): children as rows (eldest first), sessions as columns (oldest first).
 * A toggle switches between the total and each part. Children sit different papers, so each is compared with
 * their own earlier years.
 */
export function ResultsMatrix({
  rows,
  sessions,
  resultsVisible,
}: {
  rows: MatrixChild[];
  sessions: SessionColumn[];
  resultsVisible: boolean;
}) {
  const intl = useIntl();
  const router = useRouter();
  const [metric, setMetric] = useState<Metric>('total');

  const bySession = useMemo(
    () => rows.map(({ child }) => new Map(child.admissions.map((a) => [a.sessionId, a]))),
    [rows],
  );
  const sessionHasResults = sessions.map((s) =>
    rows.some(({ child }) => child.admissions.some((a) => a.sessionId === s.id && a.result?.status)),
  );

  const pinned = {
    position: 'sticky',
    insetInlineStart: 0,
    zIndex: 1,
    bgcolor: 'background.paper',
    minWidth: 140,
    borderInlineEnd: '1px solid var(--mui-palette-divider)',
  } as const;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {intl.formatMessage(messages.resultsBySession)}
        </Typography>
        {resultsVisible && (
          <ToggleButtonGroup size="small" exclusive value={metric} onChange={(_, v) => v && setMetric(v)}>
            {METRICS.map((m) => (
              <ToggleButton key={m} value={m} sx={{ px: 1.5, textTransform: 'none' }}>
                {intl.formatMessage(METRIC_LABEL[m])}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Stack>
      <Box sx={{ overflowX: 'auto', bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: 'max-content' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={pinned} />
              {sessions.map((s, i) => (
                <TableCell key={s.id} sx={{ width: CELL_WIDTH, verticalAlign: 'bottom' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {s.name}
                  </Typography>
                  {resultsVisible && !sessionHasResults[i] && (
                    <Typography variant="caption" color="text.secondary">
                      {intl.formatMessage(messages.noResultsYet)}
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ child, leftAt }, i) => {
              const age = ageOn(child.dateOfBirth);
              return (
                <TableRow key={child.id} hover>
                  <TableCell sx={{ ...pinned, verticalAlign: 'top' }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                      color={leftAt ? 'text.secondary' : 'text.primary'}
                    >
                      {firstName(child.name)}
                      {age !== undefined ? `, ${age}` : ''}
                    </Typography>
                    {leftAt && (
                      <Typography variant="caption" color="text.secondary">
                        {intl.formatMessage(messages.left, { date: leftAt.slice(0, 10) })}
                      </Typography>
                    )}
                  </TableCell>
                  {sessions.map((s) => {
                    const admission = bySession[i]?.get(s.id);
                    const leftBefore = !!leftAt && !!s.startsAt && s.startsAt > leftAt;
                    return (
                      <TableCell
                        key={s.id}
                        sx={{ verticalAlign: 'top', cursor: admission ? 'pointer' : 'default' }}
                        onClick={admission ? () => router.push(routes.students.profile(child.id)) : undefined}
                      >
                        <Cell
                          admission={admission}
                          metric={metric}
                          resultsVisible={resultsVisible}
                          leftBefore={leftBefore}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {resultsVisible && (
              <TableRow>
                <TableCell sx={{ ...pinned, fontWeight: 600 }}>{intl.formatMessage(messages.passedRow)}</TableCell>
                {sessions.map((s, i) => {
                  const finals = rows
                    .map((_, j) => bySession[j]?.get(s.id)?.result?.status)
                    .filter((st): st is NonNullable<typeof st> => !!st);
                  return (
                    <TableCell key={s.id}>
                      {sessionHasResults[i] ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {intl.formatMessage(messages.passedOf, {
                            passed: String(finals.filter((st) => st === 'PASS').length),
                            total: String(finals.length),
                          })}
                        </Typography>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {intl.formatMessage(resultsVisible ? messages.matrixNote : messages.noResultsAccess)}
      </Typography>
    </Stack>
  );
}
