import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Overlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: theme.zIndex.modal + 1,
  backgroundColor: theme.palette.action.disabled,
}));
