import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const SideNav = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  scrollbarWidth: 'none',
  borderRadius: 8,
  height: 'calc(100vh - 24px)',
  width: 'var(--SideNav-width)',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));
export const SideNavContainer = styled(Box)(({ theme }) => ({
  padding: '12px 0 12px 12px',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));
