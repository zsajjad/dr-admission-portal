import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const NavContainer = styled(Box)({
  padding: '16px',
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
  borderRadius: '999px',
  cursor: 'pointer',
  padding: '12px 20px',
  position: 'relative',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.selected,
    transform: active ? 'none' : 'translateX(4px)',
  },
  ...(disabled && {
    backgroundColor: 'var(--NavItem-disabled-background)',
    color: 'var(--NavItem-disabled-color)',
    cursor: 'not-allowed',
  }),
  ...(active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
  }),
  ...(!active &&
    !disabled && {
      backgroundColor: theme.palette.action.hover,
    }),
}));

interface NavItemTextProps extends TypographyProps {
  active?: boolean;
}

export const NavItemText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<NavItemTextProps>(({ theme, active }) => ({
  color: active ? theme.palette.common.white : theme.palette.grey[900],
  fontWeight: active ? 600 : 500,
  lineHeight: '24px',
  fontSize: '14px',
  letterSpacing: '0.01em',
}));
