import React, { FC } from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Stack, Tooltip, tooltipClasses, TooltipProps, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { colorSchemes } from '@/theme/color-schemes';
import FormattedMessage from '@/theme/FormattedMessage';
import { shadows } from '@/theme/shadows';
import { DateCell } from '@/theme/Table/Cell';

import { getSafeValue } from '@/utils';

import messages from './messages';

interface InfoTooltipProps {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive?: boolean;
}
interface TooltipItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
}
const { light } = colorSchemes;
const { palette } = light;

// Styled Tooltip with proper typing
export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: palette.common.white,
    color: palette.text.primary,
    boxShadow: shadows[10],
    marginTop: '4px !important',
    maxWidth: 300, // limit width
    whiteSpace: 'normal', // allow wrapping
    wordBreak: 'break-word', // break long words
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: palette.common.white, // arrow color
  },
}));

const TooltipItem = ({ label, value }: TooltipItemProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.7, flex: 1 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Box>
  );
};
const InfoTooltip: FC<InfoTooltipProps> = ({ createdAt, createdBy, updatedAt, updatedBy, isActive }) => {
  return (
    <StyledTooltip
      placement="bottom-start"
      arrow
      title={
        <Stack spacing={0.5} sx={{ p: 0.5 }}>
          {createdAt && (
            <TooltipItem
              label={<FormattedMessage {...messages.createdAt} />}
              value={<DateCell date={createdAt} includeTime />}
            />
          )}
          {updatedAt && (
            <TooltipItem
              label={<FormattedMessage {...messages.updatedAt} />}
              value={<DateCell date={updatedAt} includeTime />}
            />
          )}
          {createdBy && (
            <TooltipItem label={<FormattedMessage {...messages.createdBy} />} value={getSafeValue(createdBy)} />
          )}
          {updatedBy && (
            <TooltipItem label={<FormattedMessage {...messages.updatedBy} />} value={getSafeValue(updatedBy)} />
          )}

          {typeof isActive === 'boolean' && (
            <TooltipItem
              label={<FormattedMessage {...messages.isActive} />}
              value={isActive ? <FormattedMessage {...messages.active} /> : <FormattedMessage {...messages.inActive} />}
            />
          )}
        </Stack>
      }
    >
      <IconButton size="small">
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </StyledTooltip>
  );
};

export default InfoTooltip;
