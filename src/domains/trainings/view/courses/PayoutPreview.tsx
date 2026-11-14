'use client';
// cspell:words nums

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { BandInput, payoutTable } from '../../rules';
import { formatAmount } from '../../utils';

import messages from './messages';

interface PayoutPreviewProps {
  floor: number;
  bands: BandInput[];
  totalTrainings: number;
}

/** The course's payout table: bands down, trainings passed across (requirements, "Payment") */
export function PayoutPreview({ floor, bands, totalTrainings }: PayoutPreviewProps) {
  const usable = bands.filter((b) => Number.isFinite(b.minPct) && Number.isFinite(b.amount));
  if (!Number.isFinite(floor) || !usable.length || totalTrainings < 1) {
    return (
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.previewEmpty} />
      </Typography>
    );
  }
  const rows = payoutTable(floor, usable, totalTrainings);
  const top = Math.max(...rows.flatMap((r) => r.byPassed.map((c) => c.payout)));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <FormattedMessage {...messages.previewHelp} values={{ total: String(totalTrainings) }} />
      </Typography>
      <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap' } }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage {...messages.bandColumn} />
            </TableCell>
            {rows[0].byPassed.map((c) => (
              <TableCell key={c.passed} align="right">
                <FormattedMessage {...messages.passedColumn} values={{ count: String(c.passed) }} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.minPct}>
              <TableCell sx={{ fontWeight: 600 }}>
                <FormattedMessage
                  {...(row.belowPct === undefined ? messages.bandLabelTop : messages.bandLabel)}
                  values={{
                    min: String(row.minPct),
                    below: String(row.belowPct ?? ''),
                    amount: String(row.amount),
                  }}
                />
              </TableCell>
              {row.byPassed.map((c) => (
                <TableCell
                  key={c.passed}
                  align="right"
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: c.payout === top ? 700 : 400,
                    color: c.payout === floor ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {formatAmount(c.payout)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
