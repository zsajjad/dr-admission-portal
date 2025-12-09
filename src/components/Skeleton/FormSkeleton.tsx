import { Box, Divider, Grid, Paper, Skeleton } from '@mui/material';

export function FormSkeleton() {
  return (
    <Box component={Paper} sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {[...Array(3)].map((_, i) => (
          <Grid key={`common-${i}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton width="40%" />
            <Skeleton height={56} />
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2, color: 'stroke.light' }} />
        </Grid>

        {[...Array(6)].map((_, i) => (
          <Grid key={`trans-${i}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton width="40%" />
            <Skeleton height={56} />
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Skeleton height={50} />
        </Grid>
      </Grid>
    </Box>
  );
}
