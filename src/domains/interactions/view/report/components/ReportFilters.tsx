'use client';

import { Box, Stack } from '@mui/material';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { ClassLevelFilter } from '@/components/ClassLevelFilter';
import { SessionFilter } from '@/components/SessionFilter';

import { filterCardStyle } from '../styles';

export function ReportFilters() {
  return (
    <Box sx={filterCardStyle}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
        <SessionFilter />
        <BranchFilter resetFiltersOnChange={['areaId']} />
        <ClassLevelFilter />
        <AreaFilter />
      </Stack>
    </Box>
  );
}
