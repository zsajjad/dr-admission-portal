'use client';

import { useMemo } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { ClassLevel } from '@/providers/service/app.schemas';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface ClassLevelFilterState {
  classLevelId?: string;
}

export interface ClassLevelFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when class level changes */
  onClassLevelChange?: (classLevelId: string | undefined) => void;
}

export function ClassLevelFilter({ size = 'small', minWidth = 280, onClassLevelChange }: ClassLevelFilterProps) {
  const { filters, setFilter } = useListingFilters<ClassLevelFilterState>();

  // Fetch class levels for filter dropdown
  const { data: classLevelsData } = useClassLevelControllerFindAll({ take: 100 });
  const classLevels = useMemo(() => classLevelsData?.data || [], [classLevelsData?.data]);

  const selectedClassLevel = useMemo(
    () => classLevels.find((c) => c.id === filters.classLevelId) || null,
    [classLevels, filters.classLevelId],
  );

  const handleChange = (_: unknown, newValue: ClassLevel | null) => {
    const newClassLevelId = newValue?.id;
    setFilter({ classLevelId: newClassLevelId, page: 0 });
    onClassLevelChange?.(newClassLevelId);
  };

  return (
    <Autocomplete<ClassLevel, false>
      size={size}
      sx={{ minWidth }}
      options={classLevels}
      getOptionLabel={(option) => option.name || ''}
      value={selectedClassLevel}
      onChange={handleChange}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`} style={{ padding: '8px 16px' }}>
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.classLevelLabel} />}
          inputProps={{ ...params.inputProps, className: `${params.inputProps?.className || ''} font-urdu` }}
        />
      )}
    />
  );
}

export default ClassLevelFilter;
