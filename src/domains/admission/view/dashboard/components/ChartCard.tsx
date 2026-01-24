import { Box, Card, CardContent, Typography } from '@mui/material';

export interface ChartCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
}

export function ChartCard({ title, children, minHeight = 300 }: ChartCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600} color="text.primary">
          {title}
        </Typography>
        <Box sx={{ minHeight, width: '100%' }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
