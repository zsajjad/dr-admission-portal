'use client';

import * as React from 'react';

import RouterLink from 'next/link';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import FormattedMessage from '@/theme/FormattedMessage';

import type { NavGroup } from '../config';
import { navIcons } from '../NavIcons';
import type { NavItemConfig } from '../types';
import { isNavItemActive } from '../utils/isNavItemActive';

import { NavContainer, NavItemBox, NavItemText } from './Styled';

interface NavListProps {
  groups?: NavGroup[];
  pathname: string;
}

export function NavList({ groups = [], pathname }: NavListProps): React.JSX.Element {
  return (
    <NavContainer>
      {groups.map(({ key, heading, items }) => (
        <Box key={key} component="section" aria-label={heading?.defaultMessage}>
          {heading && (
            <Typography
              component="h2"
              sx={{
                px: 1.5,
                pt: 1.75,
                pb: 0.5,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              <FormattedMessage {...heading} />
            </Typography>
          )}
          <Stack component="ul" spacing={0.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map(({ key: itemKey, ...item }) => (
              <NavListItem key={itemKey} pathname={pathname} {...item} />
            ))}
          </Stack>
        </Box>
      ))}
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
        {IconComponent && (
          <IconComponent sx={{ fontSize: 20, flexShrink: 0, color: active ? 'common.white' : 'text.secondary' }} />
        )}
        <NavItemText active={active} noWrap>
          {title}
        </NavItemText>
      </NavItemBox>
    </li>
  );
}
