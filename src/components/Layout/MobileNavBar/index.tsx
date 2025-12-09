'use client';

import * as React from 'react';

import ReorderIcon from '@mui/icons-material/Reorder';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { usePopover } from '@/hooks/usePopover';

import { useAuthContext } from '@/contexts/AuthContext';

import { UserPopover } from '../UserPopover';

import { MobileNav } from './MobileNav';
import { HeaderContainer } from './Styled';

export function MobileNavBar(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const { user } = useAuthContext();
  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <HeaderContainer component="header">
        <IconButton
          onClick={(): void => {
            setOpenNav(true);
          }}
          sx={{ display: { lg: 'none' } }}
        >
          <ReorderIcon />
        </IconButton>
        {user && (
          <Box width={'100%'}>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              src={(user as any)?.avatar}
              sx={{ cursor: 'pointer', justifySelf: 'flex-end' }}
            />
          </Box>
        )}
      </HeaderContainer>
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
