import {
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';

import { AdmissionsDashboardAreaStat } from '@/providers/service/app.schemas';

import FormattedMessage from '@/theme/FormattedMessage';

import messages from '../messages';

export interface AreaComparisonTableProps {
  data: AdmissionsDashboardAreaStat[];
}

export function AreaComparisonTable({ data }: AreaComparisonTableProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2.5 }} fontWeight={600} color="text.primary">
          <FormattedMessage {...messages.areaComparison} />
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 600, width: 50, py: 1.5, px: 2 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 1.5, px: 2 }}>
                  <FormattedMessage {...messages.areaId} />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, py: 1.5, px: 2 }}>
                  <FormattedMessage {...messages.areaName} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.tiflanMale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.tiflanFemale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.muhibanMale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.muhibanFemale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.nasiranMale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.nasiranFemale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.thisYear} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.lastYear} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 1.5, px: 1.5 }}>
                  <FormattedMessage {...messages.change} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((area, index) => {
                const change = area.lastYear > 0 ? ((area.thisYear - area.lastYear) / area.lastYear) * 100 : 0;
                return (
                  <TableRow
                    key={area.id}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                    }}
                  >
                    <TableCell sx={{ color: 'text.secondary', py: 1.5, px: 2 }}>{index + 1}</TableCell>
                    <TableCell className="font-urdu" sx={{ py: 1.5, px: 2 }}>
                      {area.id}
                    </TableCell>
                    <TableCell className="font-urdu" sx={{ py: 1.5, px: 2 }}>
                      {area.name}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.tiflanMale}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.tiflanFemale}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.muhibanMale}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.muhibanFemale}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.nasiranMale}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.nasiranFemale}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5, fontWeight: 600 }}>
                      {area.thisYear}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                      {area.lastYear}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: change > 0 ? '#2E7D32' : change < 0 ? '#C0392B' : theme.palette.text.secondary,
                        py: 1.5,
                        px: 1.5,
                      }}
                    >
                      {change > 0 ? '+' : ''}
                      {change.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
