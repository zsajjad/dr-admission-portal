import type { SxProps, Theme } from '@mui/material';

// =============================================================================
// THEME COLORS - Dark Purple Palette
// =============================================================================

export const colors = {
  // Primary purple shades
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Accent colors (minimal, purposeful)
  accent: {
    success: '#10B981', // Emerald - for good ratings
    warning: '#F59E0B', // Amber - for average
    danger: '#EF4444', // Red - for low ratings
  },

  // Neutral
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray500: '#6B7280',
    gray700: '#374151',
    gray900: '#111827',
  },
};

// Rating colors - color scale from danger to success
export const RATING_COLORS: Record<number, string> = {
  1: colors.accent.danger,
  2: '#FB923C', // Orange
  3: colors.accent.warning,
  4: colors.purple[400],
  5: colors.accent.success,
};

// =============================================================================
// CARD STYLES
// =============================================================================

export const filterCardStyle: SxProps<Theme> = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  borderRadius: 3,
  border: `1px solid ${colors.purple[100]}`,
  boxShadow: `0 4px 24px ${colors.purple[500]}10`,
  p: 3,
};

export const chartCardStyle: SxProps<Theme> = {
  background: colors.neutral.white,
  borderRadius: 3,
  boxShadow: `0 2px 16px ${colors.purple[500]}08`,
  border: `1px solid ${colors.purple[50]}`,
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: `0 4px 24px ${colors.purple[500]}12`,
  },
};

export const emptyStateStyle: SxProps<Theme> = {
  textAlign: 'center',
  py: 8,
  px: 4,
  bgcolor: colors.purple[50],
  borderRadius: 3,
  border: `2px dashed ${colors.purple[200]}`,
};

// =============================================================================
// STAT CARD STYLES
// =============================================================================

export const statCardStyle = (variant: 'primary' | 'success' | 'warning' | 'danger'): SxProps<Theme> => {
  const backgrounds = {
    primary: colors.purple[600],
    success: colors.accent.success,
    warning: colors.accent.warning,
    danger: colors.accent.danger,
  };

  return {
    bgcolor: backgrounds[variant],
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    color: 'white',
    p: 3,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.14)',
    },
  };
};

// =============================================================================
// TABLE STYLES
// =============================================================================

export const tableContainerStyle: SxProps<Theme> = {
  borderRadius: 3,
  boxShadow: `0 2px 16px ${colors.purple[500]}08`,
  border: `1px solid ${colors.purple[50]}`,
  overflow: 'hidden',
};

export const tableHeaderStyle: SxProps<Theme> = {
  bgcolor: colors.purple[50],
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: colors.purple[700],
    borderBottom: `1px solid ${colors.purple[100]}`,
  },
};

export const tableRowStyle = (index: number): SxProps<Theme> => ({
  bgcolor: index % 2 === 0 ? 'transparent' : colors.purple[50] + '40',
  transition: 'background-color 0.15s ease',
  '&:hover': {
    bgcolor: colors.purple[100] + '60',
  },
});

// =============================================================================
// ACCORDION STYLES
// =============================================================================

export const accordionStyle: SxProps<Theme> = {
  '&:before': { display: 'none' },
  boxShadow: 'none',
  '&.Mui-expanded': {
    margin: 0,
  },
};

export const accordionSummaryStyle = (isExpanded: boolean): SxProps<Theme> => ({
  px: 3,
  py: 1.5,
  bgcolor: isExpanded ? colors.purple[50] + '60' : 'transparent',
  borderBottom: `1px solid ${colors.purple[100]}`,
  transition: 'background-color 0.2s ease',
  '&:hover': {
    bgcolor: colors.purple[50],
  },
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    gap: 2,
    my: 1,
  },
});

// =============================================================================
// BADGE STYLES
// =============================================================================

export const ratingBadgeStyle = (rating: number): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 24,
  borderRadius: 12,
  bgcolor: RATING_COLORS[rating] || RATING_COLORS[3],
  color: 'white',
  fontWeight: 600,
  fontSize: 12,
});

export const avgRatingChipStyle = (rating: number): SxProps<Theme> => ({
  bgcolor: getRatingColor(rating),
  color: 'white',
  fontWeight: 600,
  fontSize: 12,
  height: 24,
  '& .MuiChip-label': {
    px: 1.5,
  },
});

// Student group badge styles
export const studentGroupBadgeStyle = (type: 'best' | 'average' | 'attention'): SxProps<Theme> => {
  const configs = {
    best: { bgcolor: colors.accent.success, label: 'Can Teach' },
    average: { bgcolor: colors.accent.warning, label: 'Average' },
    attention: { bgcolor: colors.accent.danger, label: 'Needs Help' },
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1.5,
    py: 0.5,
    borderRadius: 2,
    bgcolor: configs[type].bgcolor + '15',
    color: configs[type].bgcolor,
    fontWeight: 500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getRatingColor = (avgRating: number): string => {
  if (avgRating < 2) return RATING_COLORS[1];
  if (avgRating < 2.5) return RATING_COLORS[2];
  if (avgRating < 3.5) return RATING_COLORS[3];
  if (avgRating < 4.5) return RATING_COLORS[4];
  return RATING_COLORS[5];
};

// =============================================================================
// CHART COLORS
// =============================================================================

export const chartColors = {
  primary: colors.purple[600],
  grid: colors.purple[100],
  text: colors.purple[700],
  ratings: RATING_COLORS,
};
