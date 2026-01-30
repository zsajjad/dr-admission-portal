'use client';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface GenderFilterState {
  gender?: 'MALE' | 'FEMALE';
}

export interface GenderFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when gender changes */
  onGenderChange?: (gender: 'MALE' | 'FEMALE' | undefined) => void;
}

export function GenderFilter({ size = 'small', minWidth = 150, onGenderChange }: GenderFilterProps) {
  const { filters, setFilter } = useListingFilters<GenderFilterState>();

  const formattedMessages = {
    male: useFormattedMessage(messages.male),
    female: useFormattedMessage(messages.female),
    all: useFormattedMessage(messages.all),
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const newGender = value === '' ? undefined : (value as 'MALE' | 'FEMALE');
    setFilter({ gender: newGender, page: 0 });
    onGenderChange?.(newGender);
  };

  return (
    <FormControl size={size} sx={{ minWidth }}>
      <InputLabel>
        <FormattedMessage {...messages.genderLabel} />
      </InputLabel>
      <Select
        value={filters.gender || ''}
        label={<FormattedMessage {...messages.genderLabel} />}
        onChange={handleChange}
        slotProps={{
          input: {
            className: 'font-urdu',
          },
        }}
      >
        <MenuItem value="">{formattedMessages.all}</MenuItem>
        <MenuItem value="MALE">{formattedMessages.male}</MenuItem>
        <MenuItem value="FEMALE">{formattedMessages.female}</MenuItem>
      </Select>
    </FormControl>
  );
}

export default GenderFilter;
