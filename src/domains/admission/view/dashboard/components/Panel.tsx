import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';

export interface PanelProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Controls shown at the top right, e.g. a toggle */
  action?: React.ReactNode;
  isLoading?: boolean;
  loadingHeight?: number;
  children: React.ReactNode;
}

/** A quiet card: a title, an optional line of explanation, and the content. */
export function Panel({ title, subtitle, action, isLoading, loadingHeight = 240, children }: PanelProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%', bgcolor: 'background.default' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
      >
        <Box>
          <Typography variant="subtitle1" component="h2" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {isLoading ? <Skeleton variant="rounded" height={loadingHeight} /> : children}
    </Paper>
  );
}
