import { Stack } from '@mui/material';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { SessionFilter } from '@/components/SessionFilter';

export function DashboardFilters() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <BranchFilter resetFiltersOnChange={['areaId']} />
      <SessionFilter />
      <AreaFilter />
    </Stack>
  );
}
