'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import { useNavGroups } from '../config';
import { NavList } from '../NavItems';

import { SideNav, SideNavContainer } from './Styled';

/** The menu on large screens. The brand is in the top bar above it. */
export function SideNavBar(): React.JSX.Element {
  const pathname = usePathname();
  const navGroups = useNavGroups();

  return (
    <SideNavContainer>
      <SideNav>
        <NavList pathname={pathname} groups={navGroups} />
      </SideNav>
    </SideNavContainer>
  );
}
