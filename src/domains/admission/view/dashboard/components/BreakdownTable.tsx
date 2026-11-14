'use client';

import { useState } from 'react';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { SessionDashboardBreakdownRow } from '@/providers/service/app.schemas';

import FormattedMessage from '@/theme/FormattedMessage';

import { DashboardMetric, NUMERIC } from '../constants';
import { formatNumber } from '../format';
import messages from '../messages';

import { Delta } from './Delta';
import { MetricToggle } from './MetricToggle';
import { Panel } from './Panel';

export const GROUP_LABELS = {
  TIFLAN: messages.groupTiflan,
  MUHIBAN: messages.groupMuhiban,
  NASIRAN: messages.groupNasiran,
};

export const GENDER_LABELS = {
  FEMALE: messages.girls,
  MALE: messages.boys,
};

export interface BreakdownTableProps {
  rows: SessionDashboardBreakdownRow[];
  sessionName: string;
  compareName?: string;
  /** False when the sessions cannot be lined up by day: the same-day columns are left out */
  hasSameDay: boolean;
  isLoading?: boolean;
}

/** One measure by branch, group and gender: this session, the comparison on the same day, and the difference. */
export function BreakdownTable({ rows, sessionName, compareName, hasSameDay, isLoading }: BreakdownTableProps) {
  const [metric, setMetric] = useState<DashboardMetric>('applied');

  const total = rows.reduce(
    (sum, row) => ({
      current: sum.current + row.current[metric],
      sameDay: sum.sameDay + (row.previousSameDay?.[metric] ?? 0),
      final: sum.final + (row.previousFinal?.[metric] ?? 0),
    }),
    { current: 0, sameDay: 0, final: 0 },
  );

  return (
    <Panel
      title={<FormattedMessage {...messages.breakdownTitle} />}
      action={<MetricToggle value={metric} onChange={setMetric} testId="breakdown-metric" />}
      isLoading={isLoading}
    >
      <TableContainer>
        <Table size="small" data-testid="breakdown-table">
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage {...messages.colBranch} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.colGroup} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.colGender} />
              </TableCell>
              <TableCell align="right">{sessionName}</TableCell>
              {compareName && hasSameDay && (
                <>
                  <TableCell align="right">
                    <FormattedMessage {...messages.colSameDay} values={{ compare: compareName }} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage {...messages.colDiff} />
                  </TableCell>
                </>
              )}
              {compareName && (
                <TableCell align="right">
                  <FormattedMessage {...messages.colFinal} values={{ compare: compareName }} />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.branch.id}-${row.group}-${row.gender}`} hover>
                <TableCell>{row.branch.name}</TableCell>
                <TableCell>
                  <FormattedMessage {...GROUP_LABELS[row.group]} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...GENDER_LABELS[row.gender]} />
                </TableCell>
                <TableCell align="right" sx={{ ...NUMERIC, fontWeight: 600 }}>
                  {formatNumber(row.current[metric])}
                </TableCell>
                {compareName && hasSameDay && (
                  <>
                    <TableCell align="right" sx={NUMERIC}>
                      {formatNumber(row.previousSameDay?.[metric])}
                    </TableCell>
                    <TableCell align="right" sx={NUMERIC}>
                      <Delta current={row.current[metric]} previous={row.previousSameDay?.[metric]} mode="count" />
                    </TableCell>
                  </>
                )}
                {compareName && (
                  <TableCell align="right" sx={{ ...NUMERIC, color: 'text.secondary' }}>
                    {formatNumber(row.previousFinal?.[metric])}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                  <FormattedMessage {...messages.noData} />
                </TableCell>
              </TableRow>
            ) : (
              <TableRow data-testid="breakdown-total" sx={{ '& td': { fontWeight: 700, borderBottom: 0 } }}>
                <TableCell colSpan={3}>
                  <FormattedMessage {...messages.total} />
                </TableCell>
                <TableCell align="right" sx={NUMERIC}>
                  {formatNumber(total.current)}
                </TableCell>
                {compareName && hasSameDay && (
                  <>
                    <TableCell align="right" sx={NUMERIC}>
                      {formatNumber(total.sameDay)}
                    </TableCell>
                    <TableCell align="right" sx={NUMERIC}>
                      <Delta current={total.current} previous={total.sameDay} mode="count" />
                    </TableCell>
                  </>
                )}
                {compareName && (
                  <TableCell align="right" sx={NUMERIC}>
                    {formatNumber(total.final)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Panel>
  );
}
