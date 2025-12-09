import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const NavContainer = styled(Box)({
  padding: '12px',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#E0E1E6',
    borderRadius: '8px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#CDCED7',
  },
  '&::-webkit-scrollbar-track': {
    display: 'none',
  },
});

interface NavItemBoxProps extends BoxProps {
  active?: boolean;
  disabled?: boolean;
  to?: string;
}

export const NavItemBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'disabled',
})<NavItemBoxProps>(({ theme, active, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  borderRadius: '8px',
  boxShadow: active ? '0px 2px 4px 2px rgba(16, 24, 40, 0.05)' : 'none',
  cursor: 'pointer',
  padding: '10px 16px',
  position: 'relative',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.grey[100],
  },
  ...(disabled && {
    backgroundColor: 'var(--NavItem-disabled-background)',
    color: 'var(--NavItem-disabled-color)',
    cursor: 'not-allowed',
  }),
  ...(active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  }),
}));

interface NavItemTextProps extends TypographyProps {
  active?: boolean;
}

export const NavItemText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<NavItemTextProps>(({ theme, active }) => ({
  color: active ? theme.palette.common.white : theme.palette.grey[900],
  fontWeight: 500,
  lineHeight: '24px',
  fontSize: '14px',
}));
