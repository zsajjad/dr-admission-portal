'use client';

import * as React from 'react';

import { Alert, Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

import { LookupList, LookupView, useToolLabel } from './LookupList';
import { Markdown } from './Markdown';

export interface ChatTurnProps {
  question: string;
  answer?: string;
  status?: string;
  error?: string;
  lookups: LookupView[];
  streaming?: boolean;
  usage?: { tokens: number; costUsd: number };
}

/** One question and its answer, with the lookups behind it. */
export function ChatTurn({ question, answer, status, error, lookups, streaming, usage }: ChatTurnProps) {
  const running = lookups.find((l) => l.done === false);
  const runningLabel = useToolLabel(running?.tool);
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.25,
            maxWidth: '80%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" dir="auto" sx={{ whiteSpace: 'pre-wrap' }}>
            {question}
          </Typography>
        </Paper>
      </Box>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {answer ? <Markdown text={answer} /> : null}
        {streaming ? (
          <Stack spacing={1} sx={{ mt: answer ? 1 : 0 }}>
            <Typography variant="body2" color="text.secondary">
              {running ? (
                <FormattedMessage {...messages.lookingUp} values={{ tool: runningLabel }} />
              ) : (
                <FormattedMessage {...messages.thinking} />
              )}
            </Typography>
            <LinearProgress />
          </Stack>
        ) : null}
        {!streaming && status === 'refused' ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            <FormattedMessage {...messages.refused} />
          </Alert>
        ) : null}
        {!streaming && (status === 'error' || error) ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error ?? <FormattedMessage {...messages.failed} />}
          </Alert>
        ) : null}
        <LookupList lookups={lookups} />
        {usage && usage.tokens > 0 ? (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
            <FormattedMessage
              {...messages.usage}
              values={{ tokens: usage.tokens.toLocaleString(), cost: usage.costUsd.toFixed(3) }}
            />
          </Typography>
        ) : null}
      </Paper>
    </Stack>
  );
}
