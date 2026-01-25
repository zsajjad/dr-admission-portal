import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const SideNav = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  scrollbarWidth: 'none',
  borderRadius: 16,
  height: 'calc(100vh - 32px)',
  width: 'var(--SideNav-width)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const SideNavContainer = styled(Box)(({ theme }) => ({
  padding: '16px 0 16px 16px',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));
