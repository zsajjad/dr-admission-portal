'use client';

import { Card, CardContent, Grid, Skeleton } from '@mui/material';

interface DetailSkeletonProps {
  fields?: number;
}

export function DetailSkeleton({ fields = 12 }: DetailSkeletonProps) {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          {Array.from({ length: fields }).map((_, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Skeleton width="40%" height={20} style={{ marginBottom: 4 }} />
              <Skeleton width="80%" height={28} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
