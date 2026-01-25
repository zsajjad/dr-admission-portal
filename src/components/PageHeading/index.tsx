import * as React from 'react';

import { Box, Typography, Button, Checkbox, FormControlLabel } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from './messages';

export interface PageHeadingProps {
  onAddPress?: () => void;
  onEditPress?: () => void;
  isIncludeInActive?: boolean;
  onCheckedIncludeInActive?: (checked: boolean) => void;
  heading: React.ComponentProps<typeof FormattedMessage>;
  addButtonDisable?: boolean;
  rightActions?: React.ReactNode;
}

export function PageHeading({
  heading,
  onAddPress,
  onEditPress,
  isIncludeInActive,
  onCheckedIncludeInActive,
  addButtonDisable,
  rightActions,
}: PageHeadingProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { sm: 'center' },
        gap: 2,
        mb: 3,
        p: 2.5,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        <FormattedMessage {...heading} />
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
        }}
      >
        {rightActions}
        {onCheckedIncludeInActive ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={isIncludeInActive}
                onChange={(e) => onCheckedIncludeInActive(e.target.checked)}
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label={<FormattedMessage {...messages.inActive} />}
            sx={{
              m: 0,
              px: 1.5,
              py: 0.5,
              borderRadius: '999px',
              bgcolor: 'action.hover',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          />
        ) : null}
        {onAddPress ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onAddPress}
            disabled={addButtonDisable}
            sx={{
              borderRadius: '999px',
              px: 3,
              py: 1.25,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <FormattedMessage {...messages.addNew} />
          </Button>
        ) : null}
        {onEditPress ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onEditPress}
            sx={{
              borderRadius: '999px',
              px: 3,
              py: 1.25,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <FormattedMessage {...messages.edit} />
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

export default PageHeading;
