'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { Alert, Box, Button, CircularProgress, Grid, Stack, TextField } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { TrainingSettings, useSaveTrainingSettings, useTrainingSettings } from '../../api/setup';
import { Section } from '../../components/Section';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { validateSettings } from '../../rules';
import { toNumber } from '../../utils';

import messages from './messages';

const parseDays = (text: string) =>
  text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

/** Attempts per training per session, auto-close and reminder days, shared by every training */
export function SettingsForm() {
  const intl = useIntl();
  const { canConfigure } = useTrainingsAccess();
  const notify = useNotify();
  const { data } = useTrainingSettings();
  const save = useSaveTrainingSettings();
  const loaded: TrainingSettings | undefined = data?.data;

  const [form, setForm] = useState({ maxAttempts: '', retrainBelowPct: '', autoCloseDays: '', reminderDays: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (loaded) {
      setForm({
        maxAttempts: String(loaded.maxAttempts),
        retrainBelowPct: String(loaded.retrainBelowPct),
        autoCloseDays: String(loaded.autoCloseDays),
        reminderDays: loaded.reminderDays.join(', '),
      });
    }
  }, [loaded]);

  const input = useMemo(
    () => ({
      maxAttempts: toNumber(form.maxAttempts),
      retrainBelowPct: toNumber(form.retrainBelowPct),
      autoCloseDays: toNumber(form.autoCloseDays),
      reminderDays: parseDays(form.reminderDays),
    }),
    [form],
  );
  const issues = validateSettings(input);
  const shown = submitted ? issues : [];

  const field = (name: keyof typeof form, help: { id: string; defaultMessage: string }) => (
    <TextField
      size="small"
      fullWidth
      label={<FormattedMessage {...messages[name]} />}
      value={form[name]}
      onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
      disabled={!canConfigure}
      error={shown.some((i) => i.path === name)}
      helperText={<FormattedMessage {...help} />}
    />
  );

  const handleSave = () => {
    setSubmitted(true);
    if (issues.length) return;
    save.mutate(
      { ...input, reminderDays: [...input.reminderDays].sort((a, b) => a - b) },
      { onSuccess: () => notify.success(), onError: notify.error },
    );
  };

  return (
    <Section title={<FormattedMessage {...messages.settings} />}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>{field('maxAttempts', messages.maxAttemptsHelp)}</Grid>
        <Grid size={{ xs: 12, md: 3 }}>{field('retrainBelowPct', messages.retrainBelowHelp)}</Grid>
        <Grid size={{ xs: 12, md: 3 }}>{field('autoCloseDays', messages.autoCloseHelp)}</Grid>
        <Grid size={{ xs: 12, md: 3 }}>{field('reminderDays', messages.reminderDaysHelp)}</Grid>
      </Grid>
      {shown.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {shown.map((i) => (
            <Box key={i.code}>{intl.formatMessage(messages[i.code], i.values)}</Box>
          ))}
        </Alert>
      )}
      {canConfigure && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={save.isPending}
            startIcon={save.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            <FormattedMessage {...common.save} />
          </Button>
        </Stack>
      )}
    </Section>
  );
}
