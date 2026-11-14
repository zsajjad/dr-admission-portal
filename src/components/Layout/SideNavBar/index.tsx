'use client';

import * as React from 'react';

import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { Brand } from '@/components/Logo';

import { colorSchemes } from '@/theme/color-schemes';

import { routes } from '@/router/routes';

import { useNavItems } from '../config';
import { NavList } from '../NavItems';

import { SideNav, SideNavContainer } from './Styled';

export function SideNavBar(): React.JSX.Element {
  const pathname = usePathname();
  const navItems = useNavItems();
  const {
    light: { palette },
  } = colorSchemes;

  return (
    <SideNavContainer>
      <SideNav>
        <Box
          component={RouterLink}
          href={routes.home}
          sx={{ display: 'flex', flexShrink: 0, p: '18px 16px 14px', textDecoration: 'none' }}
        >
          <Brand logoHeight="36px" size="sm" />
        </Box>
        <Divider sx={{ borderColor: palette.stroke, mx: 1 }} />
        <NavList pathname={pathname} items={navItems} />
      </SideNav>
    </SideNavContainer>
  );
}
