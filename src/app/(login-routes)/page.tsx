'use client';

import { defineMessages } from 'react-intl';

import { Box, Typography } from '@mui/material';

import { AdmissionDashboard } from '@/domains/admission/view/dashboard';

import FormattedMessage from '@/theme/FormattedMessage';

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
      <AdmissionDashboard />
    </Box>
  );
}
