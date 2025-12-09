'use client';

import * as React from 'react';
import { useCallback } from 'react';

import { defineMessages } from 'react-intl';

import { useRouter } from 'next/navigation';

import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import SupervisedUserCircleRoundedIcon from '@mui/icons-material/SupervisedUserCircleRounded';
import { Box, Card, CardActionArea, CardContent, Divider, Grid, Typography } from '@mui/material';

import { AdmissionDashboard } from '@/domains/admission/view/dashboard';

import FormattedMessage from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

const messages = defineMessages({
  welcome: {
    id: 'app.home.welcome',
    defaultMessage: 'Welcome to Admin Dashboard',
  },
  subtitle: {
    id: 'app.home.subtitle',
    defaultMessage: 'Overview of admission statistics and quick access to modules',
  },
  quickAccess: {
    id: 'app.home.quickAccess',
    defaultMessage: 'Quick Access',
  },
  adminUsers: {
    id: 'app.home.adminUsers',
    defaultMessage: 'Admin Users',
  },
  adminUsersDescription: {
    id: 'app.home.adminUsersDescription',
    defaultMessage: 'Manage administrator accounts and permissions',
  },
  branches: {
    id: 'app.home.branches',
    defaultMessage: 'Branches',
  },
  branchesDescription: {
    id: 'app.home.branchesDescription',
    defaultMessage: 'Manage branch locations and settings',
  },
  admissions: {
    id: 'app.home.admissions',
    defaultMessage: 'Admissions',
  },
  admissionsDescription: {
    id: 'app.home.admissionsDescription',
    defaultMessage: 'Handle student admissions and applications',
  },
  questionSets: {
    id: 'app.home.questionSets',
    defaultMessage: 'Question Sets',
  },
  questionSetsDescription: {
    id: 'app.home.questionSetsDescription',
    defaultMessage: 'Create and manage question sets for assessments',
  },
});

interface NavigationTile {
  title: React.ComponentProps<typeof FormattedMessage>;
  description: React.ComponentProps<typeof FormattedMessage>;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const navigationTiles: NavigationTile[] = [
  {
    title: messages.adminUsers,
    description: messages.adminUsersDescription,
    icon: <SupervisedUserCircleRoundedIcon sx={{ fontSize: 40 }} />,
    href: routes.adminUsers.listing,
    color: '#1976d2',
  },
  {
    title: messages.branches,
    description: messages.branchesDescription,
    icon: <AccountTreeRoundedIcon sx={{ fontSize: 40 }} />,
    href: routes.branches.listing,
    color: '#2e7d32',
  },
  {
    title: messages.admissions,
    description: messages.admissionsDescription,
    icon: <AssignmentIndRoundedIcon sx={{ fontSize: 40 }} />,
    href: routes.admission.listing,
    color: '#ed6c02',
  },
  {
    title: messages.questionSets,
    description: messages.questionSetsDescription,
    icon: <QuizRoundedIcon sx={{ fontSize: 40 }} />,
    href: routes.questions.listing,
    color: '#9c27b0',
  },
];

export default function HomePage() {
  const router = useRouter();
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

      {/* Quick Access Navigation Tiles */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="medium" color="text.secondary">
          <FormattedMessage {...messages.quickAccess} />
        </Typography>
        <Grid container spacing={2}>
          {navigationTiles.map((tile, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => router.push(tile.href)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    p: 2,
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${tile.color}15`,
                      color: tile.color,
                      flexShrink: 0,
                    }}
                  >
                    {tile.icon}
                  </Box>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle1" component="h2" fontWeight="medium" noWrap>
                      <FormattedMessage {...tile.title} />
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <FormattedMessage {...tile.description} />
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

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
