'use client';

import { ReactNode } from 'react';

import { useIntl } from 'react-intl';

import { Box, Chip, Skeleton, Stack, Typography, useTheme } from '@mui/material';

import { cardStyle } from '@/domains/schools/components/common';
import { formatDate } from '@/domains/students/utils';

import { DetailHeader } from '@/components/DetailHeader';

import { FamilySchooling } from '@/providers/service/app.schemas';

import { ChildSessionsData, SessionColumn } from '../api';
import messages from '../messages';
import { useFamiliesAccess } from '../permissions';
import { formatPhone, householdHeader, initials } from '../rules';

import { ChildEntry, ChildrenSchoolsTable, SchoolingLine } from './ChildrenSchoolsTable';
import { ComparisonTable } from './ComparisonTable';
import { MatrixChild, ResultsMatrix } from './ResultsMatrix';

export function Section({ title, actions, children }: { title: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {actions}
      </Stack>
      {children}
    </Stack>
  );
}

/**
 * The family page's body, shared by a confirmed household and a possible one (UX spec, screen 3): the header
 * deduced from the children, children and schools, the children side by side in one session, results by
 * session, and (for a confirmed household) its history.
 */
export function FamilyBody({
  possible,
  entries,
  childSessions,
  current,
  schooling,
  createdAt,
  chips,
  actions,
  banner,
  history,
  matrixRows,
}: {
  possible?: boolean;
  /** Current members (or the student and their possible siblings), eldest first */
  entries: ChildEntry[];
  childSessions: ChildSessionsData;
  current?: SessionColumn;
  schooling?: FamilySchooling;
  createdAt?: string;
  chips?: ReactNode;
  actions?: ReactNode;
  banner?: ReactNode;
  history?: ReactNode;
  /** The results' rows when they differ from the children shown: every member ever, those who left muted */
  matrixRows?: MatrixChild[];
}) {
  const intl = useIntl();
  const theme = useTheme();
  const access = useFamiliesAccess();

  const shown = entries.map((e) => childSessions.byId.get(e.id)).filter((c): c is NonNullable<typeof c> => !!c);
  const header = householdHeader(
    entries.map((e) => {
      const c = childSessions.byId.get(e.id);
      return {
        fatherName: c?.fatherName ?? (e as { fatherName?: string }).fatherName,
        phone: c?.phone,
        alternatePhone: c?.alternatePhone,
        area: c?.area,
        address: c?.address,
      };
    }),
  );
  const name = header.fatherName;
  const title = name
    ? intl.formatMessage(possible ? messages.possibleFamilyOf : messages.familyOf, { name })
    : intl.formatMessage(messages.familyNoName);
  const more = (value: string | undefined, count: number) =>
    value ? (count ? intl.formatMessage(messages.andMore, { value, count }) : value) : '--';

  return (
    <Stack spacing={3}>
      <DetailHeader
        mark={initials(name) || undefined}
        markColor={possible ? theme.palette.brand.gold : undefined}
        title={title}
        chips={
          <>
            <Chip
              size="small"
              variant="outlined"
              label={intl.formatMessage(messages.childrenChip, { count: entries.length })}
            />
            {chips}
          </>
        }
        fields={[
          {
            key: 'phones',
            label: intl.formatMessage(messages.fieldPhones),
            value: header.phones.length
              ? header.phones.map((p, i) => (
                  <span key={p} style={{ whiteSpace: 'nowrap' }}>
                    {i > 0 && ' · '}
                    {formatPhone(p)}
                  </span>
                ))
              : '--',
            dir: 'ltr',
          },
          {
            key: 'area',
            label: intl.formatMessage(messages.fieldArea),
            value: more(header.area ? `${header.area.code} · ${header.area.name}` : undefined, header.moreAreas),
          },
          {
            key: 'address',
            label: intl.formatMessage(messages.fieldAddress),
            value: more(header.address, header.moreAddresses),
          },
          ...(createdAt
            ? [{ key: 'since', label: intl.formatMessage(messages.fieldSince), value: formatDate(createdAt) }]
            : []),
        ]}
        actions={actions}
      />
      {banner}

      <Section title={intl.formatMessage(messages.childrenAndSchools)}>
        <Box sx={{ ...cardStyle, p: 1 }}>
          <ChildrenSchoolsTable
            entries={entries}
            childSessions={childSessions.byId}
            current={current}
            canOpenSchools={access.canOpenSchools}
          />
        </Box>
        {schooling && current && (
          <SchoolingLine schooling={schooling} sessionName={current.name} canOpenSchools={access.canOpenSchools} />
        )}
      </Section>

      {childSessions.isLoading ? (
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      ) : (
        <>
          <ComparisonTable
            childList={shown}
            sessions={childSessions.sessions}
            resultsVisible={childSessions.resultsVisible}
            trainingsVisible={childSessions.trainingsVisible}
            canOpenSchools={access.canOpenSchools}
          />
          <ResultsMatrix
            rows={matrixRows ?? shown.map((child) => ({ child }))}
            sessions={childSessions.sessions}
            resultsVisible={childSessions.resultsVisible}
          />
        </>
      )}

      {history && <Section title={intl.formatMessage(messages.history)}>{history}</Section>}
    </Stack>
  );
}
