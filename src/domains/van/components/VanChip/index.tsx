'use client';

import { Chip } from '@mui/material';

import { ClassLevelGroup } from '@/providers/service/app.schemas';
import { useBranchControllerFindOne } from '@/providers/service/branch/branch';
import { useVanControllerFindAll } from '@/providers/service/van/van';

// Helper function to determine text color based on background luminance
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

interface VanChipProps {
  areaId?: string;
  branchId?: string;
  gender?: 'MALE' | 'FEMALE';
  classLevelName?: ClassLevelGroup;
  hasVan?: boolean;
  hasBoysVan?: boolean;
}

export function VanChip({ areaId, branchId, classLevelName, hasVan, hasBoysVan }: VanChipProps) {
  // Fetch vans for this branch
  const { data: vansData } = useVanControllerFindAll({ branchId, take: 100 }, { query: { enabled: !!branchId } });

  // Fetch branch to get default color
  const { data: branchData } = useBranchControllerFindOne(branchId || '', undefined, {
    query: { enabled: !!branchId },
  });

  const branchDefaultColorHex = branchData?.data?.defaultColorHex;

  // Check fallback conditions
  // 1. Class level is "muhiban" (any gender)
  // 2. Class level is "nasiran" AND gender is MALE
  // 3. Area's hasVan is false (any gender)
  // 4. Gender is MALE AND area's hasBoysVan is false
  const shouldUseBranchDefault = classLevelName === ClassLevelGroup.TIFLAN || !hasVan || !hasBoysVan;

  if (shouldUseBranchDefault) {
    if (!branchDefaultColorHex) return null;
    return (
      <Chip
        label="Default"
        size="small"
        sx={{
          backgroundColor: branchDefaultColorHex,
          color: getContrastColor(branchDefaultColorHex),
        }}
      />
    );
  }

  // Find van that includes this areaId
  const van = vansData?.data?.find((v) => v.areas?.some((area) => area.id === areaId));

  if (!van) return null;

  return (
    <Chip
      label={van.name}
      size="medium"
      sx={{
        backgroundColor: van.colorHex,
        color: getContrastColor(van.colorHex),
      }}
    />
  );
}
