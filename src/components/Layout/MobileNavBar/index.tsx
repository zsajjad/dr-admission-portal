'use client';

import * as React from 'react';

import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';

import ReorderIcon from '@mui/icons-material/Reorder';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Brand, Logo } from '@/components/Logo';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePopover } from '@/hooks/usePopover';

import { useAuthContext } from '@/contexts/AuthContext';

import { routes } from '@/router/routes';

import { navItems } from '../config';
import messages from '../messages';
import { UserPopover } from '../UserPopover';

import { MobileNav } from './MobileNav';
import { HeaderBand, HeaderContainer } from './Styled';

/** The first part of a path: `/admission/edit/1` and `/admission?x=1` are both `/admission`. */
const section = (path: string): string => `/${path.split('?')[0].split('/')[1] ?? ''}`;

/** The title of the page being shown: the nav item whose section the path is in. Home is the dashboard. */
function usePageTitle(): React.ReactNode {
  const pathname = usePathname();
  const current = section(pathname);
  if (current === '/') return <FormattedMessage {...messages.dashboard} />;
  return navItems.find((item) => section(item.href) === current)?.title;
}

/**
 * The top bar: deep green with the brand, the current page's title and the profile menu, and a thin
 * gold band of stars under it.
 */
export function MobileNavBar(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const pageTitle = usePageTitle();
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
          <Box
            component={RouterLink}
            href={routes.home}
            sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}
          >
            {/* The full brand on wider screens; the logo alone on phones, to leave room for the title. */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Brand logoHeight="38px" inverse />
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Logo height="34px" lettersColor="#FFFFFF" label="Danishgah-e-Ramzan" />
            </Box>
          </Box>
          {pageTitle && (
            <Box
              aria-hidden
              sx={{
                width: '1px',
                height: 28,
                bgcolor: 'brand.gold',
                opacity: 0.6,
                flexShrink: 0,
                mx: { xs: 0.5, md: 1 },
              }}
            />
          )}
          {/* The page title shrinks with an ellipsis before it can reach the avatar. */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {pageTitle && (
              <Typography
                variant="h6"
                component="p"
                noWrap
                data-testid="header-title"
                sx={{ fontWeight: 600, lineHeight: 1.3, color: 'common.white' }}
              >
                {pageTitle}
              </Typography>
            )}
          </Box>
          {user && (
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              src={(user as any)?.avatar}
              sx={{
                cursor: 'pointer',
                flexShrink: 0,
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
