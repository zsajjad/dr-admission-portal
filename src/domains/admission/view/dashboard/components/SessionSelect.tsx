'use client';

import { Autocomplete, TextField } from '@mui/material';

export interface SessionOption {
  id: string;
  name: string;
}

export interface SessionSelectProps {
  label: React.ReactNode;
  options: SessionOption[];
  /** The session shown as chosen: the user's choice, or the default the server picked */
  value?: SessionOption;
  onChange: (id: string | undefined) => void;
  placeholder?: string;
  testId?: string;
}

/** A session picker. Clearing it goes back to the default. */
export function SessionSelect({ label, options, value, onChange, placeholder, testId }: SessionSelectProps) {
  return (
    <Autocomplete<SessionOption, false>
      size="small"
      sx={{ minWidth: 220 }}
      data-testid={testId}
      options={options}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      value={value ?? null}
      onChange={(_, selected) => onChange(selected?.id)}
      renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
    />
  );
}
