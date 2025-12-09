import React from 'react';

import { Visibility as EyeIcon, VisibilityOff as EyeSlashIcon } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: boolean;
  helperText?: string | false;
  showPasswordRules?: boolean;
  placeholder: string;
}

export function PasswordField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
}: PasswordFieldProps): React.JSX.Element {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <TextField
      placeholder={placeholder}
      // InputLabelProps={{ shrink: true }}
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {showPassword ? (
                <EyeIcon cursor="pointer" onClick={() => setShowPassword(false)} />
              ) : (
                <EyeSlashIcon cursor="pointer" onClick={() => setShowPassword(true)} />
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
