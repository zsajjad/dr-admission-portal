'use client';

import { ReactNode } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { ATTRIBUTE_LABELS, cardStyle } from '@/domains/schools/components/common';

import { SessionFilter } from '@/components/SessionFilter';

import { FamilyCountByValue, FamilySplitSummary } from '@/providers/service/app.schemas';
import { useFamiliesControllerReport } from '@/providers/service/families/families';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { relationMessage } from '../../components/chips';
import messages from '../../messages';
import { useFamiliesAccess } from '../../permissions';

function Kpi({ label, value }: { label: ReactNode; value: number }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary" component="div">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }} dir="ltr">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Panel({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Box sx={{ ...cardStyle, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function CountTable({ head, rows }: { head: [ReactNode, ReactNode]; rows: [ReactNode, number][] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{head[0]}</TableCell>
          <TableCell align="right">{head[1]}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(([label, n], i) => (
          <TableRow key={i}>
            <TableCell>{label}</TableCell>
            <TableCell align="right">{n}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SplitList({ split, canOpen }: { split: FamilySplitSummary; canOpen: boolean }) {
  const intl = useIntl();
  if (!split.list.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.noSplits)}
      </Typography>
    );
  }
  return (
    <Stack spacing={1} sx={{ maxHeight: 360, overflowY: 'auto' }}>
      {split.list.map((row) => (
        <Stack
          key={row.familyId}
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
        >
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            {row.members.map((m) => (
              <Typography key={m.studentId} variant="body2">
                <span dir="ltr" style={{ fontFamily: 'monospace' }}>
                  {m.grNumber}
                </span>
                {` · ${m.branchCode} · ${m.classLevelCode}${m.section ? ` ${m.section}` : ''}`}
                {m.relation !== 'SIBLING' ? ` · ${intl.formatMessage(relationMessage(m.relation))}` : ''}
                {m.vanRequired ? ` · ${intl.formatMessage(messages.van)}` : ''}
              </Typography>
            ))}
          </Stack>
          {canOpen && (
            <Button size="small" component={Link} href={routes.families.detail(row.familyId)}>
              {intl.formatMessage(messages.openFamilyShort)}
            </Button>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

/** The family report (contract, "The report"): confirmed households in a session, by GR, no names */
export function FamilyReport() {
  const intl = useIntl();
  const { isAuthenticated } = useAuthenticatedApi();
  const { canRead } = useFamiliesAccess();
  const { filters } = useListingFilters<{ sessionId?: string }>();
  const { data, isLoading, isError, error } = useFamiliesControllerReport(
    { sessionId: filters.sessionId || undefined },
    { query: { enabled: isAuthenticated } },
  );
  const r = data?.data;

  const attr = (a: 'type' | 'feeBand' | 'medium', value: string) => {
    const msg = ATTRIBUTE_LABELS[a].values[value];
    return msg ? intl.formatMessage(msg) : intl.formatMessage(messages.unknown);
  };
  const valueRows = (a: 'type' | 'feeBand' | 'medium', rows: FamilyCountByValue[]): [ReactNode, number][] =>
    rows.map((x) => [attr(a, x.value), x.children]);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <Box sx={{ width: 260 }}>
          <SessionFilter minWidth={0} defaultToActive />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage(messages.reportHelp)}
        </Typography>
      </Stack>

      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}
      {isLoading && <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />}

      {r && (
        <>
          {r.strongSuggestionsWaiting > 0 && (
            <Alert
              severity="info"
              action={
                canRead ? (
                  <Button size="small" color="inherit" component={Link} href={routes.families.review}>
                    {intl.formatMessage(messages.goToReview)}
                  </Button>
                ) : undefined
              }
            >
              {intl.formatMessage(messages.reportStrongWaiting, { count: r.strongSuggestionsWaiting })}
            </Alert>
          )}

          <Grid container spacing={2}>
            {[
              [messages.kpiFamilies, r.families],
              [messages.kpiAttending, r.familiesAttending],
              [messages.kpiSeveral, r.familiesWithSeveralAttending],
              [messages.kpiSiblings, r.familiesWithSiblingsAttending],
              [messages.kpiChildren, r.childrenAttending],
            ].map(([label, value]) => (
              <Grid key={(label as { id: string }).id} size={{ xs: 6, md: 2.4 }}>
                <Kpi
                  label={intl.formatMessage(label as { id: string; defaultMessage: string })}
                  value={value as number}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Panel title={intl.formatMessage(messages.byChildrenAttending)}>
                <CountTable
                  head={[intl.formatMessage(messages.colChildrenN), intl.formatMessage(messages.colFamilies)]}
                  rows={r.byChildrenAttending.map((x) => [x.children, x.families])}
                />
              </Panel>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Panel title={intl.formatMessage(messages.byRelation)}>
                <CountTable
                  head={[intl.formatMessage(messages.colValue), intl.formatMessage(messages.colChildrenN)]}
                  rows={r.byRelation.map((x) => [intl.formatMessage(relationMessage(x.value)), x.children])}
                />
              </Panel>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Panel title={intl.formatMessage(messages.byBranch)}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{intl.formatMessage(messages.colBranch)}</TableCell>
                      <TableCell align="right">{intl.formatMessage(messages.colFamilies)}</TableCell>
                      <TableCell align="right">{intl.formatMessage(messages.colChildrenN)}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {r.byBranch.map((b) => (
                      <TableRow key={b.branch.id}>
                        <TableCell>
                          {b.branch.code} · {b.branch.name}
                        </TableCell>
                        <TableCell align="right">{b.families}</TableCell>
                        <TableCell align="right">{b.children}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Panel>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Panel title={intl.formatMessage(messages.splitBranchesTitle, { count: r.splitBranches.families })}>
                <SplitList split={r.splitBranches} canOpen={canRead} />
              </Panel>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Panel title={intl.formatMessage(messages.splitSectionsTitle, { count: r.splitSections.families })}>
                <SplitList split={r.splitSections} canOpen={canRead} />
              </Panel>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Panel title={intl.formatMessage(messages.vanTitle)}>
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  {[
                    [messages.vanFamilies, r.vans.familiesUsingVan],
                    [messages.vanChildren, r.vans.childrenOnVan],
                    [messages.vanAll, r.vans.familiesAllOnVan],
                    [messages.vanMixed, r.vans.familiesMixed],
                  ].map(([label, value]) => (
                    <Grid key={(label as { id: string }).id} size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" component="div">
                        {intl.formatMessage(label as { id: string; defaultMessage: string })}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {value as number}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                <CountTable
                  head={[intl.formatMessage(messages.byVanChildren), intl.formatMessage(messages.colFamilies)]}
                  rows={r.vans.byVanChildren.map((x) => [x.children, x.families])}
                />
              </Panel>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Panel title={intl.formatMessage(messages.schoolingTitle)}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CountTable
                      head={[intl.formatMessage(messages.byType), '']}
                      rows={valueRows('type', r.schooling.byType)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CountTable
                      head={[intl.formatMessage(messages.byFeeBand), '']}
                      rows={valueRows('feeBand', r.schooling.byFeeBand)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CountTable
                      head={[intl.formatMessage(messages.byMedium), '']}
                      rows={valueRows('medium', r.schooling.byMedium)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CountTable
                      head={[intl.formatMessage(messages.byTopFeeBand), intl.formatMessage(messages.colFamilies)]}
                      rows={r.schooling.familiesByTopFeeBand.map((x) => [attr('feeBand', x.value), x.families])}
                    />
                  </Grid>
                </Grid>
              </Panel>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}
