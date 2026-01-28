'use client';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Box, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { colors, emptyStateStyle } from '../styles';

export function EmptyState() {
  return (
    <Box sx={emptyStateStyle}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: colors.purple[100],
          mb: 2.5,
        }}
      >
        <FilterAltOutlinedIcon
          sx={{
            fontSize: 32,
            color: colors.purple[600],
          }}
        />
      </Box>

      <Typography
        variant="h6"
        fontWeight={600}
        color="text.primary"
        gutterBottom
      >
        <FormattedMessage {...messages.selectFiltersPrompt} />
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 360, mx: 'auto' }}
      >
        <FormattedMessage {...messages.selectFiltersDescription} />
      </Typography>
    </Box>
  );
}
