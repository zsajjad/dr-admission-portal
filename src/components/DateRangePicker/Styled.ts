import { Box, styled, Typography } from '@mui/material';

import { colorSchemes } from '@/theme/color-schemes';
import { shadows } from '@/theme/shadows';

const { light } = colorSchemes;
const { palette } = light;

export const DateInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(10),
  border: `1px solid #c4c4c4`,
  padding: '14px',
  width: 'fit-content',
  borderRadius: '8px',
  cursor: 'pointer',
  position: 'relative',
}));

export const LabelChip = styled(Box)(({ theme }) => ({
  background: palette.general_main[1],
  top: theme.spacing(-3),
  padding: theme.spacing(1),
  left: theme.spacing(4),
  position: 'absolute',
}));
export const ValueWrapper = styled(Typography)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'center',
}));

export const CalendarWrapper = styled(Box)(({ theme }) => ({
  background: palette.general_main[2],
  position: 'absolute',
  zIndex: 9999,
  boxShadow: shadows[2],
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  right: theme.spacing(0),
  top: theme.spacing(10),
}));

export const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(4),
}));

export const RightButton = styled(Box)(({}) => ({
  display: 'flex',
  alignItems: 'center',
}));
