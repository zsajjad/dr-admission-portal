'use client';

import * as React from 'react';

import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { Logo } from '@/components/Logo';

import { colorSchemes } from '@/theme/color-schemes';

import { routes } from '@/router/routes';

import { navItems } from '../config';
import { NavList } from '../NavItems';

import { SideNav, SideNavContainer } from './Styled';

export function SideNavBar(): React.JSX.Element {
  const pathname = usePathname();
  const {
    light: { palette },
  } = colorSchemes;

  return (
    <SideNavContainer>
      <SideNav>
        <Box
          component={RouterLink}
          href={routes.home}
          sx={{ display: 'flex', justifyContent: 'center', p: '16px 8px' }}
        >
          <Logo height="44px" label="Danishgah-e-Ramzan" />
        </Box>
        <Divider sx={{ borderColor: palette.stroke, mx: 1 }} />
        <NavList pathname={pathname} items={navItems} />
      </SideNav>
    </SideNavContainer>
  );
}
