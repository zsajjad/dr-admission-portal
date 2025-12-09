'use client';

import * as React from 'react';

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import Image from 'next/image';
import RouterLink from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FormattedMessage } from '@/theme/FormattedMessage';

import images from '@/assets/images';

import { routes } from '@/router/routes';

import messages from './messages';

export function NotFound(): React.JSX.Element {
  return (
    <Box
      component="main"
      sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100vh', maxHeight: '100vh' }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 'md' }}>
        <Box>
          <Box sx={{ display: 'inline-block', height: 'auto', maxWidth: '100%', width: '400px' }}>
            <Image src={images.Error} style={{ width: '100%', height: '100%' }} alt="Error" />
          </Box>
        </Box>
        <Typography variant="h3" sx={{ textAlign: 'center' }}>
          <FormattedMessage {...messages.notFound} />
        </Typography>
        <Button
          component={RouterLink}
          href={routes.home}
          startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
        >
          <FormattedMessage {...messages.home} />
        </Button>
      </Stack>
    </Box>
  );
}
