'use client';

import { useMemo } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { Van } from '@/providers/service/app.schemas';
import { useVanControllerFindAll } from '@/providers/service/van/van';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface VanFilterState {
  branchId?: string;
  vanId?: string;
}

export interface VanFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when van changes */
  onVanChange?: (vanId: string | undefined) => void;
}

export function VanFilter({ size = 'small', minWidth = 280, onVanChange }: VanFilterProps) {
  const { filters, setFilter } = useListingFilters<VanFilterState>();

  // Fetch vans for filter dropdown (filtered by branchId if available)
  const { data: vansData } = useVanControllerFindAll({
    take: 100,
    branchId: filters.branchId,
  });
  const vans = useMemo(() => vansData?.data || [], [vansData?.data]);

  const selectedVan = useMemo(() => vans.find((v) => v.id === filters.vanId) || null, [vans, filters.vanId]);

  const handleChange = (_: unknown, newValue: Van | null) => {
    const newVanId = newValue?.id;
    setFilter({ vanId: newVanId, page: 0 });
    onVanChange?.(newVanId);
  };

  return (
    <Autocomplete<Van, false>
      size={size}
      sx={{ minWidth }}
      options={vans}
      getOptionLabel={(option) => option.name || ''}
      value={selectedVan}
      onChange={handleChange}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`} style={{ padding: '8px 16px' }}>
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.vanLabel} />}
          inputProps={{ ...params.inputProps, className: `${params.inputProps?.className || ''} font-urdu` }}
        />
      )}
    />
  );
}

export default VanFilter;
