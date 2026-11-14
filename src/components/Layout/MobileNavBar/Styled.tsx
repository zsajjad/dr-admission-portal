import Box, { type BoxProps } from '@mui/material/Box';
import Drawer, { type DrawerProps } from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';

import { khatamBand } from '@/components/Ornament';

type HeaderContainerProps = BoxProps;
type MobileDrawerProps = DrawerProps;

/** The deep green top bar. */
export const HeaderContainer = styled(Box)<HeaderContainerProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(0, 3),
  minHeight: '64px',
  backgroundColor: theme.palette.brand.green,
  color: theme.palette.common.white,
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(0, 1.5),
  },
}));

/** The thin gold band of stars under the top bar. */
export const HeaderBand = styled(Box)<BoxProps>(({ theme }) => ({
  height: 10,
  backgroundColor: theme.palette.brand.green,
  backgroundImage: khatamBand(theme.palette.brand.gold),
  backgroundRepeat: 'repeat-x',
  backgroundPosition: 'left center',
  borderBottom: `1px solid ${theme.palette.brand.gold}`,
}));

export const MobileDrawer = styled(Drawer)<MobileDrawerProps>(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    margin: '10px',
    height: 'calc(100vh - 20px)',
    width: 'var(--MobileNav-width)',
    zIndex: 'var(--MobileNav-zIndex)',
    borderRadius: '12px',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
}));
