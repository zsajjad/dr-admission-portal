'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Add as AddIcon,
  ArrowDownward as DownIcon,
  ArrowUpward as UpIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { DataNotFound } from '@/components/DataNotFound';
import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { CourseBody, TrainingCourse, useCourse, useCreateCourse, useUpdateCourse } from '../../api/setup';
import { Section } from '../../components/Section';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { TrainingsPermission, useTrainingsAccess } from '../../permissions';
import { COURSE_DEFAULTS, CourseInput, CourseIssue, CourseIssueCode, totalWeight, validateCourse } from '../../rules';
import { toNumber } from '../../utils';

import messages from './messages';
import { PayoutPreview } from './PayoutPreview';

interface TrainingRow {
  key: string;
  id?: string;
  code: string;
  name: string;
  nameUr: string;
  weightPct: string;
  maxMarks: string;
  passMarks: string;
}

interface BandRow {
  key: string;
  minPct: string;
  amount: string;
}

interface FormState {
  code: string;
  name: string;
  nameUr: string;
  retrainThresholdPct: string;
  maxAttempts: string;
  autoCloseDays: string;
  reminderDays: string;
  payoutFloor: string;
  trainings: TrainingRow[];
  bands: BandRow[];
}

let rowKey = 0;
const nextKey = () => `row-${(rowKey += 1)}`;

const emptyTraining = (): TrainingRow => ({
  key: nextKey(),
  code: '',
  name: '',
  nameUr: '',
  weightPct: '',
  maxMarks: '100',
  passMarks: '50',
});

function toForm(course?: TrainingCourse): FormState {
  const source = course ?? { ...COURSE_DEFAULTS, code: '', name: '', nameUr: '', trainings: [] };
  return {
    code: source.code,
    name: source.name,
    nameUr: source.nameUr ?? '',
    retrainThresholdPct: String(Number(source.retrainThresholdPct)),
    maxAttempts: String(source.maxAttempts),
    autoCloseDays: String(source.autoCloseDays),
    reminderDays: source.reminderDays.join(', '),
    payoutFloor: String(source.payoutFloor),
    trainings: course
      ? course.trainings
          .filter((t) => t.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((t) => ({
            key: nextKey(),
            id: t.id,
            code: t.code,
            name: t.name,
            nameUr: t.nameUr ?? '',
            weightPct: String(Number(t.weightPct)),
            maxMarks: String(Number(t.maxMarks)),
            passMarks: String(Number(t.passMarks)),
          }))
      : [emptyTraining()],
    bands: source.bands.map((b) => ({ key: nextKey(), minPct: String(b.minPct), amount: String(b.amount) })),
  };
}

const parseDays = (text: string): number[] =>
  text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((d) => Number(d));

function toInput(form: FormState): CourseInput {
  return {
    code: form.code,
    name: form.name,
    retrainThresholdPct: toNumber(form.retrainThresholdPct),
    maxAttempts: toNumber(form.maxAttempts),
    autoCloseDays: toNumber(form.autoCloseDays),
    reminderDays: parseDays(form.reminderDays),
    payoutFloor: toNumber(form.payoutFloor),
    bands: form.bands.map((b) => ({ minPct: toNumber(b.minPct), amount: toNumber(b.amount) })),
    trainings: form.trainings.map((t) => ({
      code: t.code,
      name: t.name,
      weightPct: toNumber(t.weightPct),
      maxMarks: toNumber(t.maxMarks),
      passMarks: toNumber(t.passMarks),
    })),
  };
}

function toBody(form: FormState): CourseBody {
  const input = toInput(form);
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    ...(form.nameUr.trim() && { nameUr: form.nameUr.trim() }),
    retrainThresholdPct: input.retrainThresholdPct,
    maxAttempts: input.maxAttempts,
    autoCloseDays: input.autoCloseDays,
    reminderDays: [...input.reminderDays].sort((a, b) => a - b),
    payoutFloor: input.payoutFloor,
    bands: [...input.bands].sort((a, b) => b.minPct - a.minPct),
    trainings: form.trainings.map((t, i) => ({
      ...(t.id && { id: t.id }),
      code: t.code.trim(),
      name: t.name.trim(),
      ...(t.nameUr.trim() && { nameUr: t.nameUr.trim() }),
      weightPct: input.trainings[i].weightPct,
      maxMarks: input.trainings[i].maxMarks,
      passMarks: input.trainings[i].passMarks,
      sortOrder: i,
    })),
  };
}

/** Which row field an issue belongs to, so the field can turn red */
const ROW_FIELD: Partial<Record<CourseIssueCode, string>> = {
  TRAINING_CODE_REQUIRED: 'code',
  TRAINING_CODE_DUPLICATE: 'code',
  TRAINING_NAME_REQUIRED: 'name',
  WEIGHT_RANGE: 'weightPct',
  MAX_MARKS_POSITIVE: 'maxMarks',
  PASS_MARKS_RANGE: 'passMarks',
  BAND_PCT_RANGE: 'minPct',
  BAND_PCT_DUPLICATE: 'minPct',
  BAND_BELOW_FLOOR: 'amount',
};

function hasIssue(issues: CourseIssue[], path: string, field?: string) {
  return issues.some((i) => i.path === path && (!field || ROW_FIELD[i.code] === field));
}

/** Create or edit a course: rules, weighted trainings, bands, and a live payout table */
export function CourseEditor({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const { canConfigure } = useTrainingsAccess();
  const notify = useNotify();
  const { data, isLoading, error } = useCourse(courseId);
  const course = data?.data;
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const saving = create.isPending || update.isPending;

  const [form, setForm] = useState<FormState>(() => toForm());
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (course) setForm(toForm(course));
  }, [course]);

  const input = useMemo(() => toInput(form), [form]);
  const issues = useMemo(() => validateCourse(input), [input]);
  const shown = submitted ? issues : [];
  const weight = totalWeight(input.trainings);
  const readOnly = !canConfigure;

  const removed = useMemo(() => {
    if (!course) return [];
    const kept = new Set(form.trainings.map((t) => t.id).filter(Boolean));
    return course.trainings.filter((t) => t.isActive && !kept.has(t.id));
  }, [course, form.trainings]);
  const inactive = course?.trainings.filter((t) => !t.isActive) ?? [];

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const setTraining = (key: string, patch: Partial<TrainingRow>) =>
    setForm((f) => ({ ...f, trainings: f.trainings.map((t) => (t.key === key ? { ...t, ...patch } : t)) }));
  const setBand = (key: string, patch: Partial<BandRow>) =>
    setForm((f) => ({ ...f, bands: f.bands.map((b) => (b.key === key ? { ...b, ...patch } : b)) }));
  const moveTraining = (index: number, by: -1 | 1) =>
    setForm((f) => {
      const trainings = [...f.trainings];
      const [row] = trainings.splice(index, 1);
      trainings.splice(index + by, 0, row);
      return { ...f, trainings };
    });

  const handleSave = () => {
    setSubmitted(true);
    setServerError('');
    if (issues.some((i) => !i.warning)) return;
    const body = toBody(form);
    const onError = (err: unknown) => {
      setServerError(extractNetworkError(err));
      notify.error(err);
    };
    if (courseId) {
      update.mutate({ id: courseId, data: body }, { onSuccess: () => notify.success(), onError });
    } else {
      create.mutate(body, {
        onSuccess: (res) => {
          notify.success();
          router.replace(res?.data?.id ? routes.trainings.course(res.data.id) : routes.trainings.courses);
        },
        onError,
      });
    }
  };

  const notFound = useFormattedMessage(common.loadError);
  if (courseId && isLoading) return <FormSkeleton />;
  if (courseId && !course) {
    return error ? (
      <Alert severity="error">
        <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
      </Alert>
    ) : (
      <DataNotFound notFoundMessage={notFound} />
    );
  }

  const field = (
    name: keyof Omit<FormState, 'trainings' | 'bands'>,
    label: React.ComponentProps<typeof FormattedMessage>,
    opts: { help?: React.ComponentProps<typeof FormattedMessage>; numeric?: boolean; dir?: 'rtl' } = {},
  ) => (
    <TextField
      size="small"
      fullWidth
      label={<FormattedMessage {...label} />}
      value={form[name]}
      onChange={(e) => set({ [name]: e.target.value })}
      disabled={readOnly}
      error={hasIssue(shown, `course.${name}`)}
      helperText={opts.help ? <FormattedMessage {...opts.help} /> : undefined}
      slotProps={{
        htmlInput: {
          ...(opts.numeric && { inputMode: 'decimal' }),
          ...(opts.dir && { dir: opts.dir, className: 'font-urdu' }),
        },
      }}
    />
  );

  const issueMessages = Array.from(
    new Map(shown.map((i) => [`${i.code}:${JSON.stringify(i.values ?? {})}`, i])).values(),
  );

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {course ? `${course.code} · ${course.name}` : <FormattedMessage {...messages.newCourseTitle} />}
        </Typography>
        {course && !course.isActive && <Chip size="small" label={<FormattedMessage {...common.inactive} />} />}
      </Stack>
      {readOnly && (
        <Alert severity="info">
          <FormattedMessage {...common.readOnly} values={{ permission: TrainingsPermission.configure }} />
        </Alert>
      )}
      {courseId && !readOnly && (
        <Alert severity="info">
          <FormattedMessage {...messages.snapshotNote} />
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title={<FormattedMessage {...messages.basics} />}>
            <Stack spacing={2}>
              {field('code', messages.code)}
              {field('name', messages.name)}
              {field('nameUr', messages.nameUr, { dir: 'rtl' })}
            </Stack>
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title={<FormattedMessage {...messages.rules} />}>
            <Grid container spacing={2}>
              <Grid size={6}>
                {field('retrainThresholdPct', messages.retrainThresholdPct, {
                  numeric: true,
                  help: messages.retrainThresholdHelp,
                })}
              </Grid>
              <Grid size={6}>{field('maxAttempts', messages.maxAttempts, { numeric: true })}</Grid>
              <Grid size={6}>
                {field('autoCloseDays', messages.autoCloseDays, { numeric: true, help: messages.autoCloseHelp })}
              </Grid>
              <Grid size={6}>{field('reminderDays', messages.reminderDays, { help: messages.reminderDaysHelp })}</Grid>
            </Grid>
          </Section>
        </Grid>

        <Grid size={12}>
          <Section
            title={<FormattedMessage {...messages.trainings} />}
            summary={
              <Chip
                size="small"
                color={weight === 100 ? 'success' : 'warning'}
                label={<FormattedMessage {...messages.totalWeight} values={{ total: String(weight) }} />}
              />
            }
            actions={
              !readOnly && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => set({ trainings: [...form.trainings, emptyTraining()] })}
                >
                  <FormattedMessage {...messages.addTraining} />
                </Button>
              )
            }
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 820, '& td': { borderBottom: 0, py: 0.75, px: 0.75 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 110 }}>
                      <FormattedMessage {...messages.code} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.name} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.nameUr} />
                    </TableCell>
                    <TableCell sx={{ width: 100 }}>
                      <FormattedMessage {...messages.weightPct} />
                    </TableCell>
                    <TableCell sx={{ width: 100 }}>
                      <FormattedMessage {...messages.maxMarks} />
                    </TableCell>
                    <TableCell sx={{ width: 100 }}>
                      <FormattedMessage {...messages.passMarks} />
                    </TableCell>
                    {!readOnly && <TableCell sx={{ width: 120 }} />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.trainings.map((t, i) => {
                    const path = `trainings.${i}`;
                    const cell = (name: keyof TrainingRow, opts: { numeric?: boolean; dir?: 'rtl' } = {}) => (
                      <TextField
                        size="small"
                        fullWidth
                        value={t[name] ?? ''}
                        onChange={(e) => setTraining(t.key, { [name]: e.target.value })}
                        disabled={readOnly}
                        error={hasIssue(shown, path, name)}
                        slotProps={{
                          htmlInput: {
                            'aria-label': name,
                            ...(opts.numeric && { inputMode: 'decimal' }),
                            ...(opts.dir && { dir: opts.dir, className: 'font-urdu' }),
                          },
                        }}
                      />
                    );
                    return (
                      <TableRow key={t.key}>
                        <TableCell>{cell('code')}</TableCell>
                        <TableCell>{cell('name')}</TableCell>
                        <TableCell>{cell('nameUr', { dir: 'rtl' })}</TableCell>
                        <TableCell>{cell('weightPct', { numeric: true })}</TableCell>
                        <TableCell>{cell('maxMarks', { numeric: true })}</TableCell>
                        <TableCell>{cell('passMarks', { numeric: true })}</TableCell>
                        {!readOnly && (
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Tooltip title={<FormattedMessage {...messages.moveUp} />}>
                              <span>
                                <IconButton size="small" disabled={i === 0} onClick={() => moveTraining(i, -1)}>
                                  <UpIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={<FormattedMessage {...messages.moveDown} />}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={i === form.trainings.length - 1}
                                  onClick={() => moveTraining(i, 1)}
                                >
                                  <DownIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={<FormattedMessage {...common.remove} />}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => set({ trainings: form.trainings.filter((r) => r.key !== t.key) })}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            {removed.length > 0 && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                <FormattedMessage
                  {...messages.removedTrainings}
                  values={{ names: removed.map((t) => `${t.code} (${t.name})`).join(', ') }}
                />
              </Alert>
            )}
            {inactive.length > 0 && (
              <Alert severity="info" variant="outlined" sx={{ mt: 1.5 }}>
                <FormattedMessage
                  {...messages.inactiveTrainings}
                  values={{ names: inactive.map((t) => `${t.code} (${t.name})`).join(', ') }}
                />
              </Alert>
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Section
            title={<FormattedMessage {...messages.payout} />}
            actions={
              !readOnly && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => set({ bands: [...form.bands, { key: nextKey(), minPct: '', amount: '' }] })}
                >
                  <FormattedMessage {...messages.addBand} />
                </Button>
              )
            }
          >
            <Stack spacing={2}>
              {field('payoutFloor', messages.payoutFloor, { numeric: true, help: messages.payoutFloorHelp })}
              <Table size="small" sx={{ '& td': { borderBottom: 0, py: 0.75, px: 0.75 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage {...messages.minPct} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.amount} />
                    </TableCell>
                    {!readOnly && <TableCell sx={{ width: 48 }} />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.bands.map((b, i) => (
                    <TableRow key={b.key}>
                      {(['minPct', 'amount'] as const).map((name) => (
                        <TableCell key={name}>
                          <TextField
                            size="small"
                            fullWidth
                            value={b[name]}
                            onChange={(e) => setBand(b.key, { [name]: e.target.value })}
                            disabled={readOnly}
                            error={hasIssue(shown, `bands.${i}`, name)}
                            slotProps={{ htmlInput: { inputMode: 'decimal', 'aria-label': name } }}
                          />
                        </TableCell>
                      ))}
                      {!readOnly && (
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => set({ bands: form.bands.filter((r) => r.key !== b.key) })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Section title={<FormattedMessage {...messages.preview} />}>
            <PayoutPreview floor={input.payoutFloor} bands={input.bands} totalTrainings={input.trainings.length} />
          </Section>
        </Grid>
      </Grid>

      {issueMessages.length > 0 && (
        <Alert severity="error">
          <FormattedMessage {...messages.fixIssues} />
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {issueMessages.map((issue) => (
              <li key={`${issue.code}:${JSON.stringify(issue.values ?? {})}`}>
                <FormattedMessage {...messages[issue.code]} values={issue.values} />
              </li>
            ))}
          </Box>
        </Alert>
      )}
      {serverError && <Alert severity="error">{serverError}</Alert>}

      {!readOnly && (
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={() => router.push(routes.trainings.courses)} disabled={saving}>
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
