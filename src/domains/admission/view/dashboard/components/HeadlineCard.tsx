import { Box, Paper, Skeleton, Typography } from '@mui/material';

import { NUMERIC } from '../constants';

export interface HeadlineCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** The comparison line: a Delta and what it is against */
  comparison?: React.ReactNode;
  /** A last, quieter line, e.g. the comparison session's final number */
  footnote?: React.ReactNode;
  isLoading?: boolean;
  testId?: string;
}

/** One headline number with its comparison underneath. */
export function HeadlineCard({ label, value, comparison, footnote, isLoading, testId }: HeadlineCardProps) {
  return (
    <Paper
      variant="outlined"
      data-testid={testId}
      sx={{ p: 2.5, borderRadius: 3, height: '100%', bgcolor: 'background.default' }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="rounded" height={76} sx={{ mt: 1 }} />
      ) : (
        <>
          <Typography variant="h4" component="div" fontWeight={700} sx={{ my: 0.5, ...NUMERIC }}>
            {value}
          </Typography>
          <Box sx={{ minHeight: 20 }}>
            <Typography variant="body2" color="text.secondary" component="div">
              {comparison}
            </Typography>
          </Box>
          {footnote && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
              {footnote}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}
