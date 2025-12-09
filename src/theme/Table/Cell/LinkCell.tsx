'use client';

import React from 'react';

import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, IconButton, Link, Tooltip } from '@mui/material';

interface LinkCellProps {
  url: string | null | undefined;
  maxWidth?: number | string;
  showIcon?: boolean;
  children?: React.ReactNode;
  displayText?: string;
}

export function LinkCell({ url, maxWidth = '200px', showIcon = true, children, displayText }: LinkCellProps) {
  const stringUrl = url?.toString() || '';
  const displayValue = children || displayText || stringUrl;

  // Check if the URL is valid
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return urlString.startsWith('http');
    } catch {
      return false;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stringUrl && isValidUrl(stringUrl)) {
      window.open(stringUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!stringUrl || !isValidUrl(stringUrl)) {
    return (
      <Box
        sx={{
          maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        {displayValue || 'No URL'}
      </Box>
    );
  }

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
      }}
    >
      <Link
        href={stringUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          textDecoration: 'none',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {displayValue}
      </Link>

      {showIcon && (
        <Tooltip title="Open in new tab" placement="top">
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              opacity: 0.6,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
