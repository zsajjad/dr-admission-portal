'use client';

import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box, Grid, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { statCardStyle } from '../styles';

interface InsightCardsProps {
  totalInteractions: number;
  overallAverageRating: number;
  totalStudentsNeedingAttention: number;
  questionsNeedingAttention: number;
}

interface GradientStatCardProps {
  title: React.ReactNode;
  value: string | number;
  variant: 'primary' | 'success' | 'warning' | 'danger';
  icon: React.ReactNode;
}

function GradientStatCard({ title, value, variant, icon }: GradientStatCardProps) {
  return (
    <Box sx={statCardStyle(variant)}>
      <Box sx={{ position: 'relative' }}>
        {/* Background icon */}
        <Box
          sx={{
            position: 'absolute',
            right: -4,
            top: -4,
            opacity: 0.15,
            '& svg': { fontSize: 56 },
          }}
        >
          {icon}
        </Box>

        {/* Content */}
        <Typography
          variant="h3"
          component="div"
          fontWeight={700}
          sx={{
            fontSize: { xs: 32, md: 40 },
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
}

export function InsightCards({
  totalInteractions,
  overallAverageRating,
  totalStudentsNeedingAttention,
  questionsNeedingAttention,
}: InsightCardsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GradientStatCard
          title={<FormattedMessage {...messages.totalInteractions} />}
          value={totalInteractions.toLocaleString()}
          variant="primary"
          icon={<GroupsRoundedIcon />}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GradientStatCard
          title={<FormattedMessage {...messages.averageRating} />}
          value={`${overallAverageRating.toFixed(1)}/5`}
          variant="success"
          icon={<StarRoundedIcon />}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GradientStatCard
          title={<FormattedMessage {...messages.studentsNeedAttention} />}
          value={totalStudentsNeedingAttention.toLocaleString()}
          variant="warning"
          icon={<WarningAmberRoundedIcon />}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GradientStatCard
          title={<FormattedMessage {...messages.questionsAlert} />}
          value={questionsNeedingAttention}
          variant="danger"
          icon={<HelpOutlineRoundedIcon />}
        />
      </Grid>
    </Grid>
  );
}
