'use client';

import { useMemo } from 'react';

import { Autocomplete, CircularProgress, InputAdornment, TextField } from '@mui/material';

import { Area } from '@/providers/service/app.schemas';
import { useAreaControllerFindAll } from '@/providers/service/area/area';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface AreaFilterState {
  branchId?: string;
  areaId?: string;
}

export interface AreaFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when area changes */
  onAreaChange?: (areaId: string | undefined) => void;
}

export function AreaFilter({ size = 'small', minWidth = 280, onAreaChange }: AreaFilterProps) {
  const { filters, setFilter } = useListingFilters<AreaFilterState>();

  // Fetch areas for filter dropdown (filtered by branchId if available)
  const { data: areasData, isLoading } = useAreaControllerFindAll({
    take: 100,
    branchId: filters.branchId,
  });
  const areas = useMemo(() => areasData?.data || [], [areasData?.data]);

  const selectedArea = useMemo(() => areas.find((a) => a.id === filters.areaId) || null, [areas, filters.areaId]);

  const handleChange = (_: unknown, newValue: Area | null) => {
    const newAreaId = newValue?.id;
    setFilter({ areaId: newAreaId, page: 0 });
    onAreaChange?.(newAreaId);
  };

  return (
    <Autocomplete<Area, false>
      size={size}
      sx={{ minWidth }}
      options={areas}
      getOptionLabel={(option) => option.name || ''}
      value={selectedArea}
      onChange={handleChange}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`} style={{ padding: '8px 16px' }}>
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.areaLabel} />}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

export default AreaFilter;
