'use client';

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowBack } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FormattedMessage } from '@/theme/FormattedMessage';

import images from '@/assets/images';

import { routes } from '@/router/routes';

import messages from './messages';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ resetErrorBoundary }: ErrorFallbackProps): React.JSX.Element {
  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 'md' }}>
        <Box>
          <Box sx={{ display: 'inline-block', height: 'auto', maxWidth: '100%', width: '400px' }}>
            <Image src={images.Error} style={{ width: '100%', height: '100%' }} alt="Error" />
          </Box>
        </Box>
        <Typography variant="h3" sx={{ textAlign: 'center' }}>
          <FormattedMessage {...messages.title} />
        </Typography>
        <Typography color="text.secondary" variant="body1" sx={{ textAlign: 'center' }}>
          <FormattedMessage {...messages.description} />
        </Typography>
        <Stack direction="row" spacing={2}>
          {resetErrorBoundary && (
            <Button onClick={resetErrorBoundary} startIcon={<ArrowBack fontSize="medium" />} variant="contained">
              <FormattedMessage {...messages.tryAgain} />
            </Button>
          )}
          <Button component={Link} href={routes.home} startIcon={<ArrowBack fontSize="medium" />} variant="outlined">
            <FormattedMessage {...messages.goHome} />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
