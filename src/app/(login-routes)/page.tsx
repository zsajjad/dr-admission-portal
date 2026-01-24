'use client';

import { useCallback } from 'react';

import { defineMessages } from 'react-intl';

import { Box, Typography } from '@mui/material';

import { AdmissionDashboard } from '@/domains/admission/view/dashboard';

import FormattedMessage from '@/theme/FormattedMessage';

import { useQueryParams } from '@/router/useQueryParams';

const messages = defineMessages({
  welcome: {
    id: 'app.home.welcome',
    defaultMessage: 'Admissions Dashboard',
  },
  subtitle: {
    id: 'app.home.subtitle',
    defaultMessage: 'Overview of admission statistics and trends',
  },
});

export default function HomePage() {
  const { getParam, setParam } = useQueryParams();

  // Get filter values from query params
  const branchId = getParam({ name: 'branchId' }) || undefined;
  const sessionId = getParam({ name: 'sessionId' }) || undefined;

  // Handle filter changes - update query params
  const handleBranchChange = useCallback(
    (newBranchId: string) => {
      setParam({
        newParams: { branchId: newBranchId || '' },
        replace: true,
        scroll: false,
      });
    },
    [setParam],
  );

  const handleSessionChange = useCallback(
    (newSessionId: string) => {
      setParam({
        newParams: { sessionId: newSessionId || '' },
        replace: true,
        scroll: false,
      });
    },
    [setParam],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          <FormattedMessage {...messages.welcome} />
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <FormattedMessage {...messages.subtitle} />
        </Typography>
      </Box>

      {/* Admission Dashboard */}
      <AdmissionDashboard
        branchId={branchId}
        sessionId={sessionId}
        onBranchChange={handleBranchChange}
        onSessionChange={handleSessionChange}
      />
    </Box>
  );
}
