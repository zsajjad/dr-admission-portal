'use client';

import type { JSX } from 'react';

import Image from 'next/image';

import Box from '@mui/material/Box';

import images from '@/assets/images';

const HEIGHT = '60px';
const WIDTH = '60px';

export interface LogoProps {
  height?: string;
  width?: string;
}

export function Logo({ height = HEIGHT, width = WIDTH, ...props }: LogoProps): JSX.Element {
  const isMobile = false;
  const url = isMobile ? images.Logo : images.LogoWithName;

  return (
    <Box sx={{ width: width, height: height, position: 'relative' }} {...props}>
      <Image src={url} alt="logo" fill objectFit="cover" />
    </Box>
  );
}
