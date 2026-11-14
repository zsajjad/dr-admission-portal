'use client';

import * as React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Brand, Logo } from '@/components/Logo';

import { colorSchemes } from '@/theme/color-schemes';
import FormattedMessage from '@/theme/FormattedMessage';

import messages from './messages';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  const { light } = colorSchemes;
  const { palette } = light;
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        {/* On small screens the brand panel is hidden, so the brand sits above the form. */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', pt: 5, px: 3 }}>
          <Brand logoHeight="52px" />
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          background: `linear-gradient(160deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          color: palette.common.white,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
        }}
      >
        <Stack spacing={4} alignItems="center" sx={{ maxWidth: '440px', textAlign: 'center' }}>
          <Logo height="200px" lettersColor={palette.common.white} />
          <Stack spacing={1.5} alignItems="center">
            <Box sx={{ width: '56px', height: '2px', bgcolor: palette.brand.gold, borderRadius: 1 }} />
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.brand.gold,
              }}
            >
              <FormattedMessage {...messages.heading} />
            </Typography>
            <Typography sx={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.78)' }}>
              <FormattedMessage {...messages.description} />
            </Typography>
          </Stack>
        </Stack>
        <Typography sx={{ position: 'absolute', bottom: 32, fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
          <FormattedMessage {...messages.foundation} />
        </Typography>
      </Box>
    </Box>
  );
}
