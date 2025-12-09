'use client';

import React, { useState } from 'react';

import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

interface CopyableCellProps {
  value: string | number | null | undefined;
  maxWidth?: number | string;
  showCopyIcon?: boolean;
  copyMessage?: string;
  tooltipTitle?: string;
  children?: React.ReactNode;
}

export function CopyableCell({
  value,
  maxWidth = '200px',
  showCopyIcon = true,
  copyMessage = 'Copied to clipboard!',
  tooltipTitle,
  children,
}: CopyableCellProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const snackbar = useSnackbarContext();

  const stringValue = value?.toString() || '';
  const displayValue = children || stringValue;
  const tooltipText = tooltipTitle || stringValue;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!stringValue) return;

    try {
      await navigator.clipboard.writeText(stringValue);
      snackbar.show({
        message: copyMessage,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to copy text:', error);
      snackbar.show({
        message: 'Failed to copy text',
        type: 'error',
      });
    }
  };

  const handleMouseEnter = () => {
    if (stringValue) {
      setTooltipOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setTooltipOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: stringValue ? 'pointer' : 'default',
        width: '100%',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Tooltip title={tooltipText} open={tooltipOpen && !!stringValue} placement="top" arrow>
        <Box
          component="span"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {displayValue}
        </Box>
      </Tooltip>
      {showCopyIcon && stringValue && (
        <Tooltip title="Click to copy" placement="top">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              opacity: 0.6,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
