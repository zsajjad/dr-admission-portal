'use client';

import { ReactNode } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { ATTRIBUTE_LABELS } from '@/domains/schools/components/common';

import { FamilyMemberAdmission, FamilyRelation, FamilySchooling, Gender } from '@/providers/service/app.schemas';

import { routes } from '@/router/routes';

import { ChildSessions, latestOf, SessionColumn } from '../api';
import messages from '../messages';
import { earlierSchools, sessionSpan } from '../rules';

import { AgeGender, ChildName } from './ChildBits';
import { SchoolCell } from './SchoolAttributes';

/** One child on the family page: a member, or a possible sibling on the possible-family page */
export interface ChildEntry {
  id: string;
  name: string;
  grNumber: string;
  gender?: Gender;
  dateOfBirth?: string;
  isActive?: boolean;
  relation?: FamilyRelation;
  isThis?: boolean;
  /** This session's admission from the family response (school details included) */
  admission?: FamilyMemberAdmission;
  /** A line under the name (e.g. "In the family since …") */
  note?: ReactNode;
  /** A second line across the row (a possible sibling's strength and reasons) */
  extra?: ReactNode;
  /** At the end of the row: the row menu, or Confirm and Not siblings */
  actions?: ReactNode;
  dashed?: boolean;
}

function LatestClass({ entry, child, current }: { entry: ChildEntry; child?: ChildSessions; current?: SessionColumn }) {
  const intl = useIntl();
  const latest = latestOf(child);
  if (!latest && !entry.admission) {
    return (
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.noAdmission)}
      </Typography>
    );
  }
  const inCurrent = entry.admission ?? (latest && latest.sessionId === current?.id ? latest : undefined);
  const line = entry.admission
    ? `${current?.name ?? ''} · ${entry.admission.branch.code} · ${entry.admission.classLevel.name}${entry.admission.section ? ` ${entry.admission.section.letter}` : ''}`
    : `${latest!.sessionName} · ${latest!.branch.code} · ${latest!.classLevel.name}${latest!.sectionLetter ? ` ${latest!.sectionLetter}` : ''}`;
  const status = inCurrent
    ? inCurrent.attending
      ? intl.formatMessage(messages.attended)
      : intl.formatMessage(messages.admittedUnpaid)
    : intl.formatMessage(messages.notIn, { session: current?.name ?? '' });
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2">{line}</Typography>
      <Typography variant="caption" color={inCurrent?.attending ? 'success.main' : 'text.secondary'}>
        {status}
      </Typography>
    </Stack>
  );
}

/** Children and schools (UX spec, screen 3): eldest first, each with the latest class and school */
export function ChildrenSchoolsTable({
  entries,
  childSessions,
  current,
  canOpenSchools,
}: {
  entries: ChildEntry[];
  childSessions: Map<string, ChildSessions>;
  current?: SessionColumn;
  canOpenSchools: boolean;
}) {
  const intl = useIntl();
  const hasActions = entries.some((e) => e.actions);
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 820 }}>
        <TableHead>
          <TableRow>
            <TableCell>{intl.formatMessage(messages.colChild)}</TableCell>
            <TableCell>{intl.formatMessage(messages.colAge)}</TableCell>
            <TableCell>{intl.formatMessage(messages.colLatestClass)}</TableCell>
            <TableCell>{intl.formatMessage(messages.colSchool)}</TableCell>
            {hasActions && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((e) => {
            const child = childSessions.get(e.id);
            const latest = latestOf(child);
            // The school of the latest admission (with its kind), else this session's from the family response
            const school = latest?.school ?? e.admission?.school ?? null;
            const before = earlierSchools(
              (child?.admissions ?? []).map((a) => ({ sessionName: a.sessionName, schoolName: a.school?.name })),
            );
            const dashed = e.dashed ? { borderTop: '1px dashed', borderColor: 'divider' } : undefined;
            return [
              <TableRow
                key={e.id}
                sx={{
                  ...(e.isThis && {
                    bgcolor: 'var(--mui-palette-brand-goldSoft)',
                    '& > td:first-of-type': {
                      borderInlineStart: '3px solid var(--mui-palette-brand-gold)',
                    },
                  }),
                  ...(e.extra && { '& > td': { borderBottom: 'none' } }),
                  '& > td': { verticalAlign: 'top', ...dashed },
                }}
              >
                <TableCell>
                  <ChildName student={e} relation={e.relation} isThis={e.isThis} muted={e.dashed} note={e.note} />
                </TableCell>
                <TableCell>
                  <AgeGender dateOfBirth={e.dateOfBirth} gender={e.gender} />
                </TableCell>
                <TableCell>
                  <LatestClass entry={e} child={child} current={current} />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <SchoolCell school={school} schoolClass={latest?.schoolClass} canOpenSchools={canOpenSchools} />
                    {before.map((s) => (
                      <Typography key={`${s.name}-${s.first}`} variant="caption" color="text.secondary">
                        {intl.formatMessage(messages.before, { school: s.name, sessions: sessionSpan(s) })}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                {hasActions && <TableCell align="right">{e.actions}</TableCell>}
              </TableRow>,
              e.extra ? (
                <TableRow key={`${e.id}-extra`}>
                  <TableCell colSpan={hasActions ? 5 : 4} sx={{ pt: 0 }}>
                    {e.extra}
                  </TableCell>
                </TableRow>
              ) : null,
            ];
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

/** "Schooling, DR1447: 2 private · highest fee band Medium · English 1, 1 unknown" */
export function SchoolingLine({
  schooling,
  sessionName,
  canOpenSchools,
}: {
  schooling: FamilySchooling;
  sessionName: string;
  canOpenSchools: boolean;
}) {
  const intl = useIntl();
  const label = (attr: 'type' | 'feeBand' | 'medium', value: string) => {
    const msg = ATTRIBUTE_LABELS[attr].values[value];
    return msg ? intl.formatMessage(msg) : intl.formatMessage(messages.unknown);
  };
  const known = (rows: { value: string; children: number }[]) =>
    rows.filter((r) => r.value !== 'UNKNOWN' && r.children);
  const types = known(schooling.byType);
  const media = known(schooling.byMedium);
  const total = schooling.byType.reduce((n, r) => n + r.children, 0);
  if (!types.length && !media.length && schooling.topFeeBand === 'UNKNOWN') {
    return (
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="body2" color="text.secondary">
          {total > 0 ? intl.formatMessage(messages.schoolingNotKnown) : null}
        </Typography>
        {total > 0 && canOpenSchools && (
          <Button size="small" component={Link} href={routes.schools.listing}>
            {intl.formatMessage(messages.openSchools)}
          </Button>
        )}
      </Stack>
    );
  }
  const unknown = schooling.byType.find((r) => r.value === 'UNKNOWN')?.children ?? 0;
  const parts = [
    types.map((r) => `${r.children} ${label('type', r.value)}`).join(', '),
    schooling.topFeeBand !== 'UNKNOWN'
      ? intl.formatMessage(messages.schoolingTop, { band: label('feeBand', schooling.topFeeBand) })
      : '',
    media.map((r) => `${label('medium', r.value)} ${r.children}`).join(', '),
    unknown ? intl.formatMessage(messages.schoolingUnknown, { count: unknown }) : '',
  ].filter(Boolean);
  return (
    <Typography variant="body2" color="text.secondary">
      {intl.formatMessage(messages.schoolingLine, { session: sessionName, parts: parts.join(' · ') })}
    </Typography>
  );
}
