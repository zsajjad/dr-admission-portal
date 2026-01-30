'use client';

import { useMemo } from 'react';

import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { Area } from '@/providers/service/app.schemas';
import { useAreaControllerFindAll } from '@/providers/service/area/area';

import FormattedMessage from '@/theme/FormattedMessage';

import messages from './messages';

export interface AreaSelectProps {
  /** Current value (area ID) */
  value: string;
  /** Branch ID to filter areas by */
  branchId?: string;
  /** Change handler - receives area ID or empty string */
  onChange: (areaId: string) => void;
  /** Blur handler for touched tracking */
  onBlur?: () => void;
  /** Error message to display */
  error?: string;
  /** Whether the field has been touched */
  touched?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is full width */
  fullWidth?: boolean;
}

export function AreaSelect({
  value,
  branchId,
  onChange,
  onBlur,
  error,
  touched,
  size = 'medium',
  disabled = false,
  fullWidth = true,
}: AreaSelectProps) {
  // Fetch areas filtered by branchId
  const { data: areasData, isLoading } = useAreaControllerFindAll({
    take: 100,
    branchId,
  });
  const areas = useMemo(() => areasData?.data || [], [areasData?.data]);

  const selectedArea = useMemo(() => areas.find((a) => a.id === value) || null, [areas, value]);

  const handleChange = (_: unknown, newValue: Area | null) => {
    onChange(newValue?.id || '');
  };

  const showError = touched && Boolean(error);
  const isDisabled = disabled || !branchId;

  return (
    <Autocomplete<Area, false>
      size={size}
      fullWidth={fullWidth}
      options={areas}
      getOptionLabel={(option) => option.name || ''}
      value={selectedArea}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={isDisabled}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`} style={{ padding: '8px 16px' }}>
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.areaLabel} />}
          error={showError}
          helperText={showError ? error : undefined}
          slotProps={{
            input: {
              ...params.InputProps,
              className: `${params.InputProps.className || ''} font-urdu`,
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

export default AreaSelect;
