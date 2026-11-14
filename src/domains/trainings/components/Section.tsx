import { ReactNode } from 'react';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import { cardStyle } from '../utils';

interface SectionProps {
  title: ReactNode;
  /** Shown next to the title, e.g. a summary chip */
  summary?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/** A titled card, the building block of the trainings pages */
export function Section({ title, summary, actions, children }: SectionProps) {
  return (
    <Card sx={{ ...cardStyle, height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {summary}
          </Stack>
          {actions && <Box>{actions}</Box>}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
