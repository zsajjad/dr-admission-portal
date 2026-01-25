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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600} color="text.primary">
          <FormattedMessage {...messages.areaComparison} />
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderRadius: 2,
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell sx={{ fontWeight: 600, width: 40, p: 1 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.areaId} />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.areaName} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.tiflanMale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.tiflanFemale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.muhibanMale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.muhibanFemale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.nasiranMale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.nasiranFemale} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.thisYear} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
                  <FormattedMessage {...messages.lastYear} />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, p: 1 }}>
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
                    <TableCell sx={{ color: 'text.secondary', p: 1 }}>{index + 1}</TableCell>
                    <TableCell className="font-urdu" sx={{ p: 1 }}>
                      {area.id}
                    </TableCell>
                    <TableCell className="font-urdu" sx={{ p: 1 }}>
                      {area.name}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.tiflanMale}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.tiflanFemale}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.muhibanMale}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.muhibanFemale}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.nasiranMale}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.nasiranFemale}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1, fontWeight: 600 }}>
                      {area.thisYear}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      {area.lastYear}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: change > 0 ? '#2E7D32' : change < 0 ? '#C0392B' : theme.palette.text.secondary,
                        p: 1,
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
