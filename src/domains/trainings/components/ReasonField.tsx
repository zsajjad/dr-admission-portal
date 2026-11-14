'use client';

import { TextField } from '@mui/material';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

interface ReasonFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Show the required error (after a submit attempt) */
  showError?: boolean;
  required?: boolean;
  label?: React.ComponentProps<typeof FormattedMessage>;
}

/** Core refuses shorter reasons */
export const REASON_MIN = 3;

export const reasonMissing = (value: string) => value.trim().length < REASON_MIN;

/** The reason every audited change asks for */
export function ReasonField({
  value,
  onChange,
  showError,
  required = true,
  label = messages.reason,
}: ReasonFieldProps) {
  const requiredText = useFormattedMessage(messages.reasonTooShort);
  const help = useFormattedMessage(messages.reasonHelp);
  const missing = required && !!showError && reasonMissing(value);
  return (
    <TextField
      size="small"
      fullWidth
      required={required}
      multiline
      minRows={2}
      label={<FormattedMessage {...label} />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={missing}
      helperText={missing ? requiredText : help}
    />
  );
}
