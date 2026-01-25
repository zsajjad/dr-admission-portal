'use client';

import { useMemo } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { Branch } from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface BranchFilterState {
  branchId?: string;
}

export interface BranchFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when branch changes */
  onBranchChange?: (branchId: string | undefined) => void;
  /** Additional filters to reset when branch changes (e.g., ['areaId']) */
  resetFiltersOnChange?: string[];
}

export function BranchFilter({
  size = 'small',
  minWidth = 180,
  onBranchChange,
  resetFiltersOnChange = [],
}: BranchFilterProps) {
  const { filters, setFilter } = useListingFilters<BranchFilterState>();

  // Fetch branches for filter dropdown
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const branches = useMemo(() => branchesData?.data || [], [branchesData?.data]);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === filters.branchId) || null,
    [branches, filters.branchId],
  );

  const handleChange = (_: unknown, newValue: Branch | null) => {
    const newBranchId = newValue?.id;

    // Build the filter update with any additional resets
    const filterUpdate: Record<string, string | number | boolean | undefined> = { branchId: newBranchId, page: 0 };
    resetFiltersOnChange.forEach((key) => {
      filterUpdate[key] = undefined;
    });

    setFilter(filterUpdate);
    onBranchChange?.(newBranchId);
  };

  return (
    <Autocomplete<Branch, false>
      size={size}
      sx={{ minWidth }}
      options={branches}
      getOptionLabel={(option) => option.name || ''}
      value={selectedBranch}
      onChange={handleChange}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className="font-urdu">
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={<FormattedMessage {...messages.branchLabel} />} className="font-urdu" />
      )}
    />
  );
}

export default BranchFilter;
