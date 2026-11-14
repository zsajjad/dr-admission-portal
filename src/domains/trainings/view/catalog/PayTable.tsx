'use client';

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { BandInput, payTable } from '../../rules';
import { formatAmount } from '../../utils';

import messages from './messages';

interface PayTableProps {
  maxMarks: number;
  passMarks: number;
  floor: number;
  bands: BandInput[];
}

/** One training's pay: the band for the score when passed, the floor when tested and failed */
export function PayTable({ maxMarks, passMarks, floor, bands }: PayTableProps) {
  const usable = bands.filter((b) => Number.isFinite(b.minPct) && Number.isFinite(b.amount));
  if (!usable.length || !Number.isFinite(floor)) return null;
  const rows = payTable({ maxMarks, passMarks, bands: usable });
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <FormattedMessage {...messages.previewHelp} values={{ floor: formatAmount(floor) }} />
      </Typography>
      <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap' } }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage {...messages.bandColumn} />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage {...messages.passedPay} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.minPct} sx={{ opacity: row.reachable ? 1 : 0.5 }}>
              <TableCell>
                <FormattedMessage
                  {...(row.belowPct === undefined ? messages.bandLabelTop : messages.bandLabel)}
                  values={{ min: String(row.minPct), below: String(row.belowPct ?? '') }}
                />
                {!row.reachable && (
                  <Typography component="span" variant="caption" color="text.secondary">
                    {' '}
                    (<FormattedMessage {...messages.belowPass} />)
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {row.reachable ? formatAmount(row.amount) : '--'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} sx={{ color: 'text.secondary' }}>
              <FormattedMessage {...messages.failedPay} values={{ floor: formatAmount(floor) }} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}
