import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const Container = styled(Box)({
  display: 'flex',
  height: '100vh',
});
export const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  width: '100%',
  [theme.breakpoints.up('lg')]: {
    width: 'calc(100vw - var(--SideNav-width))',
  },
}));
export const Content = styled(Box)(() => ({
  height: '100%',
  minHeight: 'calc(100vh - 64px)',
  flex: 1,
  padding: '12px 20px 24px 20px',
  overflow: 'auto',
}));
