'use client';

import type { JSX } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { LOGO_LETTERS, LOGO_ORNAMENT, LOGO_VIEW_BOX } from './logo-paths';

/** Width over height of the logo, so it can be sized by either. */
const ASPECT = 161.4 / 177.3;

export interface LogoProps {
  /** CSS height, e.g. '40px'. The width follows. */
  height?: string;
  /** CSS width, used only when no height is given. */
  width?: string;
  /** Color of the lettering. Defaults to the brand navy; pass white on dark backgrounds. */
  lettersColor?: string;
  /** Accessible name. Without it the logo is decorative. */
  label?: string;
  sx?: SxProps<Theme>;
}

/**
 * The Danishgah-e-Ramzan logo, drawn inline: the frame and diamond in brand gold, the lettering in navy
 * (or `lettersColor`). The same paths as the public website, so both stay identical.
 */
export function Logo({ height, width, lettersColor, label, sx }: LogoProps): JSX.Element {
  const size = height ? { height, width: 'auto' } : { width: width ?? '60px', height: 'auto' };
  return (
    <Box
      component="svg"
      viewBox={LOGO_VIEW_BOX}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      sx={[{ display: 'block', flexShrink: 0, aspectRatio: `${ASPECT}`, ...size }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box component="path" d={LOGO_ORNAMENT} sx={{ fill: (theme) => theme.palette.brand.gold }} />
      <Box component="path" d={LOGO_LETTERS} sx={{ fill: (theme) => lettersColor ?? theme.palette.brand.navy }} />
    </Box>
  );
}

export interface BrandProps {
  /** Logo height; the text scales with the variant. */
  logoHeight?: string;
  /** For dark backgrounds: white lettering and text. */
  inverse?: boolean;
}

/** The logo with the program's name and "Admin portal", for the sign-in page and the mobile menu. */
export function Brand({ logoHeight = '48px', inverse = false }: BrandProps): JSX.Element {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Logo height={logoHeight} lettersColor={inverse ? '#FFFFFF' : undefined} />
      <Stack spacing={0.25}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            color: inverse ? 'common.white' : 'brand.navy',
          }}
        >
          Danishgah-e-Ramzan
        </Typography>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            lineHeight: 1.2,
            color: inverse ? 'brand.gold' : 'brand.goldText',
          }}
        >
          Admin portal
        </Typography>
      </Stack>
    </Stack>
  );
}
