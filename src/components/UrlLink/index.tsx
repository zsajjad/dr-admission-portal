import React from 'react';

import Link from 'next/link';

import { Box, useTheme } from '@mui/material';

interface UrlLinkProps {
  url: string;
  maxLength?: number;
}

export const UrlLink: React.FC<UrlLinkProps> = ({ url, maxLength = 30 }) => {
  const { palette } = useTheme();

  const displayText = url.length > maxLength ? `${url.slice(0, maxLength)}…` : url;

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <Box component="span" sx={{ color: palette.primary.main, wordBreak: 'break-all' }}>
        {displayText}
      </Box>
    </Link>
  );
};
