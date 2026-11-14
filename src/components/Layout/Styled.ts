import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  // The ivory page; cards sit on it in white.
  backgroundColor: theme.palette.background.default,
}));

/** Everything under the top bar: the side nav and the page. */
export const Body = styled(Box)({
  display: 'flex',
  flex: '1 1 auto',
  minHeight: 0,
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
  flex: 1,
  padding: '24px 24px 24px 24px',
  overflow: 'auto',
}));
