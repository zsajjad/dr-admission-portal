'use client';

import { useMemo } from 'react';

import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { ClassLevelGroup } from '@/providers/service/app.schemas';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface ClassLevelGroupFilterState {
  classLevelGroup?: string;
}

export interface ClassLevelGroupFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when class level changes */
  onClassLevelGroupChange?: (classLevelGroup: string | undefined) => void;
}

interface ClassLevelGroupData {
  group: ClassLevelGroup;
}

export function ClassLevelGroupFilter({
  size = 'small',
  minWidth = 280,
  onClassLevelGroupChange,
}: ClassLevelGroupFilterProps) {
  const { filters, setFilter } = useListingFilters<ClassLevelGroupFilterState>();

  // For loading indicator
  const { isLoading } = useClassLevelControllerFindAll({ take: 100 });

  const classLevelGroupData = useMemo(() => {
    return Object.values(ClassLevelGroup).map((classLevelGroup) => {
      return {
        group: classLevelGroup,
      };
    });
  }, []);

  const selectedClassLevelGroup = useMemo(
    () => classLevelGroupData.find((c) => c.group === filters.classLevelGroup) || null,
    [classLevelGroupData, filters.classLevelGroup],
  );

  const handleClassLevelGroupChange = (_: unknown, newValue: ClassLevelGroupData | null) => {
    const newClassLevelGroupId = newValue?.group;
    setFilter({ classLevelGroup: newClassLevelGroupId, page: 0 });
    onClassLevelGroupChange?.(newClassLevelGroupId);
  };

  return (
    <Autocomplete<ClassLevelGroupData, false>
      size={size}
      sx={{ minWidth }}
      options={classLevelGroupData}
      getOptionLabel={(option) => option.group || ''}
      isOptionEqualToValue={(option, value) => option.group === value.group}
      value={selectedClassLevelGroup}
      onChange={handleClassLevelGroupChange}
      renderOption={(props, option) => (
        <li {...props} key={option.group} className={`${props.className || ''}`} style={{ padding: '8px 16px' }}>
          {option.group}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.label} />}
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

export default ClassLevelGroupFilter;
