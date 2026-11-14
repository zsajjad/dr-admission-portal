import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const NavContainer = styled(Box)({
  padding: '8px',
  // Fills the rest of the side nav and scrolls when the list is taller than the screen.
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
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
  gap: 12,
  width: '100%',
  height: 32,
  padding: '0 12px',
  borderRadius: '10px',
  cursor: 'pointer',
  position: 'relative',
  textDecoration: 'none',
  transition: 'background-color 0.15s ease-in-out',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.light : theme.palette.action.hover,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: 2,
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
  color: active ? theme.palette.common.white : theme.palette.text.primary,
  fontWeight: active ? 600 : 500,
  lineHeight: '20px',
  fontSize: '14px',
}));
