'use client';

import * as React from 'react';

import RouterLink from 'next/link';

import Stack from '@mui/material/Stack';

import { navIcons } from '../NavIcons';
import type { NavItemConfig } from '../types';
import { isNavItemActive } from '../utils/isNavItemActive';

import { NavContainer, NavItemBox, NavItemText } from './Styled';

interface NavListProps {
  items?: NavItemConfig[];
  pathname: string;
}

export function NavList({ items = [], pathname }: NavListProps): React.JSX.Element {
  return (
    <NavContainer>
      <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {items.map(({ key, ...item }) => (
          <NavListItem key={key} pathname={pathname} {...item} />
        ))}
      </Stack>
    </NavContainer>
  );
}

interface NavListItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavListItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
}: NavListItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });
  const IconComponent = icon ? navIcons[icon][active ? 'filled' : 'outlined'] : null;

  return (
    <li>
      <NavItemBox
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
            }
          : { role: 'button' })}
        active={active}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
      >
        {IconComponent && <IconComponent sx={{ fontSize: 24, color: active ? 'common.white' : 'grey.900' }} />}
        <NavItemText active={active}>{title}</NavItemText>
      </NavItemBox>
    </li>
  );
}
