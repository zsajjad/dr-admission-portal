import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const Container = styled(Box)({
  display: 'flex',
  height: '100vh',
  background: `
    linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.02) 50%, rgba(236, 72, 153, 0.03) 100%),
    linear-gradient(225deg, rgba(59, 130, 246, 0.04) 0%, transparent 50%),
    linear-gradient(315deg, rgba(16, 185, 129, 0.02) 0%, transparent 40%)
  `,
  backgroundColor: '#f8fafc',
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
  padding: '16px 24px 24px 24px',
  overflow: 'auto',
}));
