'use client';

import * as React from 'react';

import { useIntl } from 'react-intl';

import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

interface Props {
  disabled: boolean;
  streaming: boolean;
  onSend: (question: string) => void;
  onStop: () => void;
}

export function Composer({ disabled, streaming, onSend, onStop }: Props) {
  const intl = useIntl();
  const [value, setValue] = React.useState('');
  const send = () => {
    const q = value.trim();
    if (!q || disabled || streaming) return;
    onSend(q);
    setValue('');
  };
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={6}
          value={value}
          disabled={disabled}
          placeholder={intl.formatMessage(messages.placeholder)}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          inputProps={{ maxLength: 2000, dir: 'auto' }}
        />
        {streaming ? (
          <Button variant="outlined" color="inherit" startIcon={<StopIcon />} onClick={onStop} sx={{ flexShrink: 0 }}>
            <FormattedMessage {...messages.stop} />
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            disabled={disabled || !value.trim()}
            onClick={send}
            sx={{ flexShrink: 0 }}
          >
            <FormattedMessage {...messages.send} />
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        <FormattedMessage {...messages.privacyHint} />
      </Typography>
    </Paper>
  );
}
