'use client';

import { useMemo } from 'react';

import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { Branch } from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';

import FormattedMessage from '@/theme/FormattedMessage';

import messages from './messages';

export interface BranchSelectProps {
  /** Current value (branch ID) */
  value: string;
  /** Change handler - receives branch ID or empty string */
  onChange: (branchId: string) => void;
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

export function BranchSelect({
  value,
  onChange,
  onBlur,
  error,
  touched,
  size = 'medium',
  disabled = false,
  fullWidth = true,
}: BranchSelectProps) {
  // Fetch branches for dropdown
  const { data: branchesData, isLoading } = useBranchControllerFindAll({ take: 100 });
  const branches = useMemo(() => branchesData?.data || [], [branchesData?.data]);

  const selectedBranch = useMemo(() => branches.find((b) => b.id === value) || null, [branches, value]);

  const handleChange = (_: unknown, newValue: Branch | null) => {
    onChange(newValue?.id || '');
  };

  const showError = touched && Boolean(error);

  return (
    <Autocomplete<Branch, false>
      size={size}
      fullWidth={fullWidth}
      options={branches}
      getOptionLabel={(option) => option.name || ''}
      value={selectedBranch}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`} style={{ padding: '8px 16px' }}>
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.branchLabel} />}
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

export default BranchSelect;
