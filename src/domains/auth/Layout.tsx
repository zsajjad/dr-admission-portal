'use client';

import * as React from 'react';

import Image from 'next/image';
import RouterLink from 'next/link';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Logo } from '@/components/Logo';

import { colorSchemes } from '@/theme/color-schemes';
import FormattedMessage from '@/theme/FormattedMessage';

import images from '@/assets/images';

import { routes } from '@/router/routes';

import { config } from '@/config';

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
        <Box component={RouterLink} href={routes.home} sx={{ p: 3 }}>
          <Logo width={'200px'} />
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          background: palette.primary.dark,
          color: palette.common.white,
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography
              sx={{ fontSize: '24px', lineHeight: '32px', textAlign: 'center', fontWeight: 400 }}
              variant="h1"
            >
              <FormattedMessage {...messages.heading} />
              <Typography component="span" variant="h5">
                {config.site.name}
              </Typography>
            </Typography>
            <Typography align="center" variant="subtitle1" mx={10}>
              <FormattedMessage {...messages.description} />
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Box sx={{ height: '300px', width: '400px' }}>
              <Image src={images.Logo} style={{ width: '100%', height: '100%' }} alt={''} />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
