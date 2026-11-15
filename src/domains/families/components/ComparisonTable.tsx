'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import {
  Box,
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

import { ChildSessions, SessionColumn } from '../api';
import messages from '../messages';
import { firstName, pctOf } from '../rules';

import { ResultSummary } from './chips';
import { SchoolCell } from './SchoolAttributes';

/**
 * The children side by side in one session: class, school (type, fee band, medium), result and theory,
 * attendance and trainings passed against due. Defaults to the latest session any of them was admitted in.
 */
export function ComparisonTable({
  childList,
  sessions,
  resultsVisible,
  trainingsVisible,
  canOpenSchools,
}: {
  childList: ChildSessions[];
  sessions: SessionColumn[];
  resultsVisible: boolean;
  trainingsVisible: boolean;
  canOpenSchools: boolean;
}) {
  const intl = useIntl();
  const withAdmissions = useMemo(
    () => sessions.filter((s) => childList.some((c) => c.admissions.some((a) => a.sessionId === s.id))),
    [sessions, childList],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const sessionId = picked ?? withAdmissions[withAdmissions.length - 1]?.id ?? '';

  if (!withAdmissions.length) return null;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {intl.formatMessage(messages.compareTitle)}
        </Typography>
        <TextField
          select
          size="small"
          label={intl.formatMessage(messages.compareSession)}
          value={sessionId}
          onChange={(e) => setPicked(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {[...withAdmissions].reverse().map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Box sx={{ overflowX: 'auto', bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Table size="small" sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>{intl.formatMessage(messages.colChild)}</TableCell>
              <TableCell>{intl.formatMessage(messages.colClass)}</TableCell>
              <TableCell>{intl.formatMessage(messages.colSchool)}</TableCell>
              {resultsVisible && <TableCell>{intl.formatMessage(messages.colResult)}</TableCell>}
              {resultsVisible && <TableCell>{intl.formatMessage(messages.colTheory)}</TableCell>}
              <TableCell>{intl.formatMessage(messages.colAttendance)}</TableCell>
              {trainingsVisible && <TableCell>{intl.formatMessage(messages.colTrainings)}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {childList.map((c) => {
              const a = c.admissions.find((x) => x.sessionId === sessionId);
              const r = a?.result;
              const attendancePct = pctOf(a?.attendanceDays, a?.attendanceTotal);
              return (
                <TableRow key={c.id} sx={{ '& > td': { verticalAlign: 'top' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {firstName(c.name)}
                    </Typography>
                  </TableCell>
                  {!a ? (
                    <TableCell colSpan={3 + (resultsVisible ? 2 : 0) + (trainingsVisible ? 1 : 0)}>
                      <Typography variant="body2" color="text.secondary">
                        {intl.formatMessage(messages.notAdmittedIn)}
                      </Typography>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>
                        <Typography variant="body2">
                          {a.branch.code} · {a.classLevel.name}
                          {a.sectionLetter ? ` ${a.sectionLetter}` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <SchoolCell school={a.school} schoolClass={a.schoolClass} canOpenSchools={canOpenSchools} />
                      </TableCell>
                      {resultsVisible && (
                        <TableCell>
                          <ResultSummary
                            status={r?.status}
                            pct={r?.pct}
                            branchRank={r?.branchRank}
                            rankedOf={r?.rankedOf}
                            dense
                          />
                        </TableCell>
                      )}
                      {resultsVisible && (
                        <TableCell>
                          <Typography variant="body2" dir="ltr">
                            {r?.theoryMarks !== null && r?.theoryMarks !== undefined
                              ? intl.formatMessage(messages.marksOf, {
                                  marks: String(r.theoryMarks),
                                  max: String(r.theoryMax ?? '?'),
                                })
                              : r?.theoryPct !== null && r?.theoryPct !== undefined
                                ? `${Math.round(r.theoryPct)}%`
                                : '--'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2">
                          {attendancePct !== undefined ? `${attendancePct}%` : '--'}
                        </Typography>
                        {a.attendanceTotal ? (
                          <Typography variant="caption" color="text.secondary">
                            {intl.formatMessage(messages.daysOf, {
                              days: String(a.attendanceDays ?? 0),
                              total: String(a.attendanceTotal),
                            })}
                          </Typography>
                        ) : null}
                      </TableCell>
                      {trainingsVisible && (
                        <TableCell>
                          <Typography variant="body2">
                            {a.trainings
                              ? intl.formatMessage(messages.trainingsOf, {
                                  passed: String(a.trainings.passed),
                                  due: String(a.trainings.due),
                                })
                              : '--'}
                          </Typography>
                        </TableCell>
                      )}
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}
