'use client';

import { Chip } from '@mui/material';

// Helper function to determine text color based on background luminance
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export interface VanChipProps {
  /** Display name for the van color */
  colorName: string;
  /** Hex color for the chip background (e.g. #44734B) */
  colorHex: string;
  /** Chip size */
  size?: 'small' | 'medium';
}

export function VanChip({ colorName, colorHex, size = 'medium' }: VanChipProps) {
  return (
    <Chip
      label={colorName}
      size={size}
      sx={{
        backgroundColor: colorHex,
        color: getContrastColor(colorHex),
      }}
    />
  );
}

export default VanChip;
