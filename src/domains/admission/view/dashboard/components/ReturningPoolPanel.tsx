'use client';

import { useState } from 'react';

import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { SessionDashboardReturningPool } from '@/providers/service/app.schemas';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { SERIES_COLORS, NUMERIC } from '../constants';
import { formatNumber, sessionLabel, share } from '../format';
import messages from '../messages';

import { GROUP_LABELS } from './BreakdownTable';
import { Panel } from './Panel';

type View = 'area' | 'class' | 'group' | 'branch';

const VIEWS: Array<{ view: View; label: (typeof messages)[keyof typeof messages] }> = [
  { view: 'area', label: messages.byArea },
  { view: 'class', label: messages.byClass },
  { view: 'group', label: messages.byGroup },
  { view: 'branch', label: messages.byBranch },
];

/** Rows shown before "Show all" */
const SHORT_LIST = 8;

interface Row {
  key: string;
  name: string;
  pool: number;
  returned: number;
  remaining: number;
}

export interface ReturningPoolPanelProps {
  pool?: SessionDashboardReturningPool;
  isLoading?: boolean;
}

/**
 * Who has not come back yet: last session's students who can return, split by area, by the class
 * they would be in now, by group or by branch, with the most still missing first.
 */
export function ReturningPoolPanel({ pool, isLoading }: ReturningPoolPanelProps) {
  const [view, setView] = useState<View>('area');
  const [showAll, setShowAll] = useState(false);
  const girls = useFormattedMessage(messages.girls);
  const boys = useFormattedMessage(messages.boys);
  const groupNames = {
    TIFLAN: useFormattedMessage(GROUP_LABELS.TIFLAN),
    MUHIBAN: useFormattedMessage(GROUP_LABELS.MUHIBAN),
    NASIRAN: useFormattedMessage(GROUP_LABELS.NASIRAN),
  };

  const rows: Row[] = !pool
    ? []
    : view === 'area'
      ? pool.byArea.map((r) => ({
          ...r,
          key: r.areaId,
          name: r.branchCode ? `${r.name} (${r.branchCode})` : r.name,
        }))
      : view === 'class'
        ? pool.byClass.map((r) => ({ ...r, key: r.classLevelId }))
        : view === 'group'
          ? pool.byGroup.map((r) => ({
              ...r,
              key: `${r.group}-${r.gender}`,
              name: `${groupNames[r.group]} · ${r.gender === 'FEMALE' ? girls : boys}`,
            }))
          : pool.byBranch.map((r) => ({ ...r, key: r.branch.id, name: r.branch.name }));

  const compare = sessionLabel(pool?.compareSession);
  const session = sessionLabel(pool?.session);
  const totals = pool?.totals;
  const visible = showAll ? rows : rows.slice(0, SHORT_LIST);

  return (
    <Panel
      title={<FormattedMessage {...messages.poolTitle} />}
      subtitle={
        pool?.compareSession ? <FormattedMessage {...messages.poolSubtitle} values={{ compare, session }} /> : undefined
      }
      action={
        pool?.compareSession ? (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            data-testid="pool-view"
            onChange={(_, next: View | null) => {
              if (!next) return;
              setView(next);
              setShowAll(false);
            }}
          >
            {VIEWS.map((v) => (
              <ToggleButton key={v.view} value={v.view} sx={{ textTransform: 'none', px: 1.5, whiteSpace: 'nowrap' }}>
                <FormattedMessage {...v.label} />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : undefined
      }
      isLoading={isLoading}
      loadingHeight={360}
    >
      {!pool?.compareSession || !totals ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.poolEmpty} />
        </Typography>
      ) : (
        <Stack spacing={2} data-testid="returning-pool">
          <Box>
            <Typography variant="body1" fontWeight={600} data-testid="pool-summary">
              <FormattedMessage
                {...messages.poolSummary}
                values={{ remaining: formatNumber(totals.remaining), pool: formatNumber(totals.pool) }}
              />
            </Typography>
            <LinearProgress
              variant="determinate"
              value={share(totals.returned, totals.pool) ?? 0}
              sx={{
                height: 10,
                borderRadius: 1,
                my: 1,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': { bgcolor: SERIES_COLORS.current, borderRadius: 1 },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              <FormattedMessage {...messages.returnedSoFar} values={{ returned: formatNumber(totals.returned) }} />
              {totals.agedOut + totals.terminated > 0 && (
                <>
                  {' · '}
                  <FormattedMessage
                    {...messages.poolLeftOut}
                    values={{ agedOut: formatNumber(totals.agedOut), terminated: formatNumber(totals.terminated) }}
                  />
                </>
              )}
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" data-testid="pool-table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage {...(VIEWS.find((v) => v.view === view) ?? VIEWS[0]).label} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage {...messages.colPool} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage {...messages.colReturned} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage {...messages.colRemaining} />
                  </TableCell>
                  <TableCell sx={{ width: '28%' }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.key} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right" sx={{ ...NUMERIC, color: 'text.secondary' }}>
                      {formatNumber(row.pool)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...NUMERIC, color: 'text.secondary' }}>
                      {formatNumber(row.returned)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...NUMERIC, fontWeight: 700 }}>
                      {formatNumber(row.remaining)}
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={share(row.returned, row.pool) ?? 0}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': { bgcolor: SERIES_COLORS.current, borderRadius: 1 },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {rows.length > SHORT_LIST && (
            <Box>
              <Button size="small" onClick={() => setShowAll((v) => !v)} data-testid="pool-show-all">
                {showAll ? (
                  <FormattedMessage {...messages.showLess} />
                ) : (
                  <FormattedMessage {...messages.showAll} values={{ count: formatNumber(rows.length) }} />
                )}
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Panel>
  );
}
