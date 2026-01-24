import { Card, CardContent, Typography, useTheme } from '@mui/material';

export interface StatCardProps {
  title: React.ReactNode;
  value: number | string;
  subtitle?: string;
  color?: string;
}

export function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
        },
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ color: color || theme.palette.primary.main }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
