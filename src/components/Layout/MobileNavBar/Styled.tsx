import Box, { type BoxProps } from '@mui/material/Box';
import Drawer, { type DrawerProps } from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';

type HeaderContainerProps = BoxProps;
type MobileDrawerProps = DrawerProps;

export const HeaderContainer = styled(Box)<HeaderContainerProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  minHeight: '64px',
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
