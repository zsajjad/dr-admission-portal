'use client';

import * as React from 'react';

import RouterLink from 'next/link';

import ReorderIcon from '@mui/icons-material/Reorder';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { Brand } from '@/components/Logo';

import { usePopover } from '@/hooks/usePopover';

import { useAuthContext } from '@/contexts/AuthContext';

import { routes } from '@/router/routes';

import { UserPopover } from '../UserPopover';

import { MobileNav } from './MobileNav';
import { HeaderBand, HeaderContainer } from './Styled';

/** The top bar: deep green with the brand and the profile menu, and a thin gold band of stars under it. */
export function MobileNavBar(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const { user } = useAuthContext();
  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <Box component="header" sx={{ flexShrink: 0 }}>
        <HeaderContainer>
          <IconButton
            aria-label="Menu"
            onClick={(): void => {
              setOpenNav(true);
            }}
            sx={{ display: { lg: 'none' }, color: 'common.white' }}
          >
            <ReorderIcon />
          </IconButton>
          <Box component={RouterLink} href={routes.home} sx={{ display: 'flex', textDecoration: 'none', mr: 'auto' }}>
            <Brand logoHeight="38px" inverse />
          </Box>
          {user && (
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              src={(user as any)?.avatar}
              sx={{
                cursor: 'pointer',
                width: 36,
                height: 36,
                bgcolor: 'brand.ivory',
                color: 'primary.main',
                border: '2px solid',
                borderColor: 'brand.gold',
              }}
            />
          )}
        </HeaderContainer>
        <HeaderBand aria-hidden />
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
