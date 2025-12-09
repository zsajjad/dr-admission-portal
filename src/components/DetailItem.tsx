import { Grid, Typography } from '@mui/material';

import { getSafeValue } from '@/utils';

interface DetailItemProps {
  dir?: string;
  label: React.ReactNode;
  value?: React.ReactNode | string;
  size?: object;
}

export function DetailItem({ label, value, size = { xs: 12, sm: 6, lg: 3 }, ...rest }: DetailItemProps) {
  return (
    <Grid size={size}>
      <Typography variant="subtitle2" {...rest}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        {...rest}
        sx={{
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {getSafeValue(value)}
      </Typography>
    </Grid>
  );
}
