'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import ReorderIcon from '@mui/icons-material/Reorder';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePopover } from '@/hooks/usePopover';

import { useAuthContext } from '@/contexts/AuthContext';

import { navItems } from '../config';
import messages from '../messages';
import { UserPopover } from '../UserPopover';

import { MobileNav } from './MobileNav';
import { HeaderContainer } from './Styled';

/** The first part of a path: `/admission/edit/1` and `/admission?x=1` are both `/admission`. */
const section = (path: string): string => `/${path.split('?')[0].split('/')[1] ?? ''}`;

/** The title of the page being shown: the nav item whose section the path is in. Home is the dashboard. */
function usePageTitle(): React.ReactNode {
  const pathname = usePathname();
  const current = section(pathname);
  if (current === '/') return <FormattedMessage {...messages.dashboard} />;
  return navItems.find((item) => section(item.href) === current)?.title;
}

export function MobileNavBar(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const pageTitle = usePageTitle();
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
        {/* The page title, with the program name under it. It shrinks before it can reach the avatar. */}
        <Box sx={{ flex: 1, minWidth: 0, px: { xs: 1.5, lg: 1 } }}>
          <Typography
            variant="h6"
            component="p"
            noWrap
            data-testid="header-title"
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
          >
            {pageTitle ?? <FormattedMessage {...messages.programName} />}
          </Typography>
          {pageTitle && (
            <Typography variant="caption" component="p" noWrap color="text.secondary">
              <FormattedMessage {...messages.programName} />
            </Typography>
          )}
        </Box>
        {user && (
          <Avatar
            onClick={userPopover.handleOpen}
            ref={userPopover.anchorRef}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            src={(user as any)?.avatar}
            sx={{ cursor: 'pointer', flexShrink: 0 }}
          />
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
