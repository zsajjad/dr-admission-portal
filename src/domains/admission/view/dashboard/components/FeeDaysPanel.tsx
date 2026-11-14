import { Box, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { SessionDashboardFeeProgress } from '@/providers/service/app.schemas';

import FormattedMessage from '@/theme/FormattedMessage';

import { NUMERIC } from '../constants';
import { formatDate, formatNumber } from '../format';
import messages from '../messages';

import { Panel } from './Panel';

/** Days listed, newest first */
const DAYS_SHOWN = 6;

export interface FeeDaysPanelProps {
  fee?: SessionDashboardFeeProgress;
  isLoading?: boolean;
}

/** Fee collection: paid today, who is verified and still to pay, and the last few days by group. */
export function FeeDaysPanel({ fee, isLoading }: FeeDaysPanelProps) {
  const days = [...(fee?.days ?? [])].reverse().slice(0, DAYS_SHOWN);

  return (
    <Panel
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <span>
            <FormattedMessage {...messages.feeTitle} />
          </span>
          {fee?.inProgress && (
            <Chip
              size="small"
              color="success"
              variant="outlined"
              data-testid="fee-in-progress"
              label={<FormattedMessage {...messages.feeInProgress} />}
            />
          )}
        </Stack>
      }
      isLoading={isLoading}
      loadingHeight={160}
    >
      <Stack spacing={2} data-testid="fee-days">
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage {...messages.feePaidToday} />
            </Typography>
            <Typography variant="h6" component="div" fontWeight={700} data-testid="fee-paid-today">
              {formatNumber(fee?.paidToday ?? 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage {...messages.feeAwaiting} />
            </Typography>
            <Typography variant="h6" component="div" fontWeight={700} data-testid="fee-awaiting">
              {formatNumber(fee?.awaitingFee ?? 0)}
            </Typography>
          </Box>
        </Stack>
        {days.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.feeNone} />
          </Typography>
        ) : (
          <Table size="small" sx={{ '& td, & th': { ...NUMERIC } }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage {...messages.colDate} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.groupTiflan} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.groupMuhiban} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.groupNasiran} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.total} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{formatDate(day.date)}</TableCell>
                  <TableCell align="right">{formatNumber(day.tiflan)}</TableCell>
                  <TableCell align="right">{formatNumber(day.muhiban)}</TableCell>
                  <TableCell align="right">{formatNumber(day.nasiran)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatNumber(day.paid)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Stack>
    </Panel>
  );
}
