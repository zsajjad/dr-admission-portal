'use client';

import * as React from 'react';

import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { Brand } from '@/components/Logo';

import { colorSchemes } from '@/theme/color-schemes';

import { routes } from '@/router/routes';

import { navItems } from '../config';
import { NavList } from '../NavItems';

import { MobileDrawer } from './Styled';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { light } = colorSchemes;
  const { palette } = light;

  return (
    <MobileDrawer open={open} onClose={onClose}>
      <Box
        component={RouterLink}
        href={routes.home}
        sx={{ display: 'flex', justifyContent: 'center', p: '24px 16px', textDecoration: 'none' }}
      >
        <Brand logoHeight="44px" />
      </Box>

      <Divider sx={{ borderColor: palette.stroke }} />
      <NavList pathname={pathname} items={navItems} />
    </MobileDrawer>
  );
}
