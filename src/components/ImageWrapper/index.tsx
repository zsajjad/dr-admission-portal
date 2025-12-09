'use client';

import Image, { StaticImageData } from 'next/image';

import Box from '@mui/material/Box';

import images from '@/assets/images';

const HEIGHT = '60px';
const WIDTH = '60px';

export interface ImageWrapperProps {
  height?: string;
  width?: string;
  src?: StaticImageData | string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function ImageWrapper({
  height = HEIGHT,
  width = WIDTH,
  src = images.LogoWithName,
  alt = 'image',
  objectFit = 'cover',
  ...props
}: ImageWrapperProps) {
  return (
    <Box sx={{ width: width, height: height, position: 'relative' }}>
      <Image src={src} alt={alt} fill objectFit={objectFit} {...props} />
    </Box>
  );
}
