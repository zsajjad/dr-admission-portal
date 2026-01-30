'use client';

import { useMemo } from 'react';

import { Chip } from '@mui/material';

import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';

// Group colors extracted from legacy system
const GROUP_COLORS: Record<string, string> = {
  TIFLAN: '#FECF8D', // rgb(254, 207, 141)
  MUHIBAN: '#5CBEEB', // rgb(92, 190, 235)
  NASIRAN: '#44734B', // rgb(68, 115, 75)
};

// Helper function to determine text color based on background luminance
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export interface ClassLevelChipProps {
  /** Class level ID to look up */
  classLevelId?: string;
  /** Chip size */
  size?: 'small' | 'medium';
}

export function ClassLevelChip({ classLevelId, size = 'medium' }: ClassLevelChipProps) {
  // Fetch all class levels (cached by React Query)
  const { data: classLevelsData } = useClassLevelControllerFindAll({ take: 100 });

  // Find the class level by ID
  const classLevel = useMemo(() => {
    if (!classLevelId || !classLevelsData?.data) return null;
    return classLevelsData.data.find((cl) => cl.id === classLevelId);
  }, [classLevelId, classLevelsData]);

  if (!classLevel) return null;

  const backgroundColor = classLevel.group ? GROUP_COLORS[classLevel.group] || '#9E9E9E' : '#9E9E9E';
  const textColor = getContrastColor(backgroundColor);

  return (
    <Chip
      label={classLevel.name}
      size={size}
      className="font-urdu"
      sx={{
        backgroundColor,
        color: textColor,
      }}
    />
  );
}

export default ClassLevelChip;
