import { Box, Card, CardContent, Typography } from '@mui/material';

import { chartCardStyle, colors } from '../styles';

export interface ChartCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
}

export function ChartCard({ title, children, minHeight = 350 }: ChartCardProps) {
  return (
    <Card sx={chartCardStyle}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} color={colors.purple[800]} sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ minHeight, width: '100%' }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
