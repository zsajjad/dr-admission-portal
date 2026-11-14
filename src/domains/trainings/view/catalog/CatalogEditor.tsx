'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { useRouter } from 'next/navigation';

import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  CatalogBody,
  CatalogTraining,
  STEP_SKILLS,
  StepSkill,
  useCatalogTraining,
  useCreateCatalogTraining,
  useUpdateCatalogTraining,
} from '../../api/setup';
import { Section } from '../../components/Section';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { TrainingsPermission, useTrainingsAccess } from '../../permissions';
import { TRAINING_DEFAULTS, validateTraining } from '../../rules';
import { toNumber } from '../../utils';

import messages from './messages';
import { PayTable } from './PayTable';

interface Form {
  code: string;
  name: string;
  nameUr: string;
  requiredFromAge: string;
  gender: 'BOTH' | 'MALE' | 'FEMALE';
  maxMarks: string;
  passMarks: string;
  payoutFloor: string;
  stepSkill: StepSkill | '';
  sortOrder: string;
  bands: { key: number; minPct: string; amount: string }[];
}

let key = 0;
const toForm = (t?: CatalogTraining): Form => {
  const src = t ?? { ...TRAINING_DEFAULTS, code: '', name: '', nameUr: '', requiredFromAge: 6, sortOrder: 0 };
  return {
    code: src.code,
    name: src.name,
    nameUr: src.nameUr ?? '',
    requiredFromAge: String(src.requiredFromAge),
    gender: t?.gender ?? 'BOTH',
    maxMarks: String(src.maxMarks),
    passMarks: String(src.passMarks),
    payoutFloor: String(src.payoutFloor),
    stepSkill: t?.stepSkill ?? '',
    sortOrder: String(src.sortOrder ?? 0),
    bands: src.bands.map((b) => ({ key: (key += 1), minPct: String(b.minPct), amount: String(b.amount) })),
  };
};

/** Create or edit one catalog training, with its pay table */
export function CatalogEditor({ trainingId }: { trainingId?: string }) {
  const intl = useIntl();
  const router = useRouter();
  const notify = useNotify();
  const { canConfigure } = useTrainingsAccess();
  const readOnly = !canConfigure;
  const { data, isLoading, error } = useCatalogTraining(trainingId);
  const training = data?.data;
  const create = useCreateCatalogTraining();
  const update = useUpdateCatalogTraining();
  const saving = create.isPending || update.isPending;

  const [form, setForm] = useState<Form>(() => toForm());
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (training) setForm(toForm(training));
  }, [training]);

  const input = useMemo(
    () => ({
      code: form.code,
      name: form.name,
      requiredFromAge: toNumber(form.requiredFromAge),
      maxMarks: toNumber(form.maxMarks),
      passMarks: toNumber(form.passMarks),
      payoutFloor: toNumber(form.payoutFloor),
      bands: form.bands.map((b) => ({ minPct: toNumber(b.minPct), amount: toNumber(b.amount) })),
    }),
    [form],
  );
  const issues = validateTraining(input);
  const shown = submitted ? issues : [];
  const bad = (path: string) => shown.some((i) => i.path === path);

  if (trainingId && isLoading) return <FormSkeleton />;
  if (trainingId && !training) {
    return (
      <Alert severity="error">
        <FormattedMessage {...common.loadError} />
        {error ? `: ${extractNetworkError(error)}` : ''}
      </Alert>
    );
  }

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const text = (name: keyof Form, opts: { help?: { id: string; defaultMessage: string }; rtl?: boolean } = {}) => (
    <TextField
      size="small"
      fullWidth
      label={<FormattedMessage {...messages[name as keyof typeof messages]} />}
      value={form[name] as string}
      onChange={(e) => set({ [name]: e.target.value })}
      disabled={readOnly}
      error={bad(name)}
      helperText={opts.help ? <FormattedMessage {...opts.help} /> : undefined}
      slotProps={{ htmlInput: opts.rtl ? { dir: 'rtl', className: 'font-urdu' } : { 'aria-label': name } }}
    />
  );

  const handleSave = () => {
    setSubmitted(true);
    if (issues.length) return;
    const body: CatalogBody = {
      code: form.code.trim(),
      name: form.name.trim(),
      ...(form.nameUr.trim() && { nameUr: form.nameUr.trim() }),
      requiredFromAge: input.requiredFromAge,
      gender: form.gender === 'BOTH' ? null : form.gender,
      maxMarks: input.maxMarks,
      passMarks: input.passMarks,
      payoutFloor: input.payoutFloor,
      bands: [...input.bands].sort((a, b) => b.minPct - a.minPct),
      stepSkill: form.stepSkill || null,
      sortOrder: toNumber(form.sortOrder) || 0,
    };
    if (trainingId) {
      update.mutate({ id: trainingId, data: body }, { onSuccess: () => notify.success(), onError: notify.error });
    } else {
      create.mutate(body, {
        onSuccess: (res) => {
          notify.success();
          router.replace(res?.data?.id ? routes.trainings.catalogTraining(res.data.id) : routes.trainings.catalog);
        },
        onError: notify.error,
      });
    }
  };

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {training ? `${training.code} · ${training.name}` : <FormattedMessage {...messages.newTraining} />}
      </Typography>
      {readOnly ? (
        <Alert severity="info">
          <FormattedMessage {...common.readOnly} values={{ permission: TrainingsPermission.configure }} />
        </Alert>
      ) : (
        trainingId && (
          <Alert severity="info">
            <FormattedMessage {...messages.snapshotNote} />
          </Alert>
        )
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title={<FormattedMessage {...messages.trainingSection} />}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                {text('code')}
                {text('sortOrder')}
              </Stack>
              {text('name')}
              {text('nameUr', { rtl: true })}
              <Stack direction="row" spacing={2}>
                {text('requiredFromAge', { help: messages.requiredFromAgeHelp })}
                <TextField
                  select
                  size="small"
                  fullWidth
                  label={<FormattedMessage {...messages.gender} />}
                  value={form.gender}
                  onChange={(e) => set({ gender: e.target.value as Form['gender'] })}
                  disabled={readOnly}
                >
                  <MenuItem value="BOTH">{intl.formatMessage(common.both)}</MenuItem>
                  <MenuItem value="MALE">{intl.formatMessage(common.boys)}</MenuItem>
                  <MenuItem value="FEMALE">{intl.formatMessage(common.girls)}</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" spacing={2}>
                {text('maxMarks')}
                {text('passMarks')}
              </Stack>
              <TextField
                select
                size="small"
                label={<FormattedMessage {...messages.stepSkill} />}
                value={form.stepSkill}
                onChange={(e) => set({ stepSkill: e.target.value as Form['stepSkill'] })}
                disabled={readOnly}
                helperText={<FormattedMessage {...messages.stepSkillHelp} />}
                slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
              >
                <MenuItem value="">{intl.formatMessage(messages.stepNone)}</MenuItem>
                {STEP_SKILLS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {intl.formatMessage(messages[`step_${s}`])}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title={<FormattedMessage {...messages.payout} />}
            actions={
              !readOnly && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => set({ bands: [...form.bands, { key: (key += 1), minPct: '', amount: '' }] })}
                >
                  <FormattedMessage {...messages.addBand} />
                </Button>
              )
            }
          >
            <Stack spacing={2}>
              {text('payoutFloor', { help: messages.payoutFloorHelp })}
              <Table size="small" sx={{ '& td': { borderBottom: 0, py: 0.5, px: 0.5 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage {...messages.minPct} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.amount} />
                    </TableCell>
                    {!readOnly && <TableCell />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.bands.map((b, i) => (
                    <TableRow key={b.key}>
                      {(['minPct', 'amount'] as const).map((f) => (
                        <TableCell key={f}>
                          <TextField
                            size="small"
                            fullWidth
                            value={b[f]}
                            disabled={readOnly}
                            error={bad(`bands.${i}`)}
                            onChange={(e) =>
                              set({
                                bands: form.bands.map((x) => (x.key === b.key ? { ...x, [f]: e.target.value } : x)),
                              })
                            }
                            slotProps={{ htmlInput: { inputMode: 'decimal', 'aria-label': f } }}
                          />
                        </TableCell>
                      ))}
                      {!readOnly && (
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => set({ bands: form.bands.filter((x) => x.key !== b.key) })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <FormattedMessage {...messages.preview} />
                </Typography>
                <PayTable
                  maxMarks={input.maxMarks}
                  passMarks={input.passMarks}
                  floor={input.payoutFloor}
                  bands={input.bands}
                />
              </Box>
            </Stack>
          </Section>
        </Grid>
      </Grid>

      {shown.length > 0 && (
        <Alert severity="error">
          <FormattedMessage {...messages.fixIssues} />
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {Array.from(new Set(shown.map((i) => i.code))).map((code) => (
              <li key={code}>{intl.formatMessage(messages[code], shown.find((i) => i.code === code)?.values)}</li>
            ))}
          </Box>
        </Alert>
      )}

      {!readOnly && (
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={() => router.push(routes.trainings.catalog)} disabled={saving}>
            <FormattedMessage {...common.cancel} />
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            <FormattedMessage {...common.save} />
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
