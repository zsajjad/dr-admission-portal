'use client';

import { useEffect, useMemo, useState } from 'react';

import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Skeleton,
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
import { alpha } from '@mui/material/styles';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { AgeRule, useAgeRules, useCourses, useReplaceAgeRules } from '../../api/setup';
import { Section } from '../../components/Section';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { TrainingsPermission, useTrainingsAccess } from '../../permissions';
import { AgeRuleInput, MatrixGender, rulesFor, uncoveredAges, validateAgeRules } from '../../rules';
import { toNumber } from '../../utils';

import messages from './messages';

/** The program's ages (6–24); the grid widens to show any rule outside them */
const PROGRAM_AGES = { from: 6, to: 24 };

interface Row {
  key: string;
  minAge: string;
  maxAge: string;
  gender: MatrixGender | 'BOTH';
  courseId: string;
}

let rowKey = 0;
const toRows = (rules: AgeRule[]): Row[] =>
  [...rules]
    .sort((a, b) => a.minAge - b.minAge || (a.gender ?? '').localeCompare(b.gender ?? ''))
    .map((r) => ({
      key: `rule-${(rowKey += 1)}`,
      minAge: String(r.minAge),
      maxAge: String(r.maxAge),
      gender: r.gender ?? 'BOTH',
      courseId: r.courseId,
    }));

const toInput = (rows: Row[]): AgeRuleInput[] =>
  rows.map((r) => ({
    minAge: toNumber(r.minAge),
    maxAge: toNumber(r.maxAge),
    gender: r.gender === 'BOTH' ? null : r.gender,
    courseId: r.courseId,
  }));

/** Edit the training × age matrix: age range and gender → course, overlaps refused */
export function AgeMatrixEditor() {
  const { canConfigure } = useTrainingsAccess();
  const readOnly = !canConfigure;
  const notify = useNotify();
  const savedText = useFormattedMessage(messages.savedMatrix);
  const { data, isLoading, error } = useAgeRules();
  const { data: coursesData } = useCourses();
  const replace = useReplaceAgeRules();

  const courses = useMemo(() => coursesData?.data ?? [], [coursesData]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const [rows, setRows] = useState<Row[]>([]);
  const [initial, setInitial] = useState<string>('[]');

  useEffect(() => {
    if (!data?.data) return;
    const loaded = toRows(data.data);
    setRows(loaded);
    setInitial(JSON.stringify(toInput(loaded)));
  }, [data]);

  const input = useMemo(() => toInput(rows), [rows]);
  const issues = useMemo(() => validateAgeRules(input), [input]);
  const dirty = JSON.stringify(input) !== initial;

  const labels = {
    boys: useFormattedMessage(common.boys),
    girls: useFormattedMessage(common.girls),
  };

  const setRow = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const addRow = () => {
    const last = input.reduce((max, r) => (Number.isFinite(r.maxAge) ? Math.max(max, r.maxAge) : max), -1);
    const from = last >= 0 ? last + 1 : PROGRAM_AGES.from;
    setRows((rs) => [
      ...rs,
      { key: `rule-${(rowKey += 1)}`, minAge: String(from), maxAge: String(from), gender: 'BOTH', courseId: '' },
    ]);
  };

  const handleSave = () => {
    if (issues.length) return;
    replace.mutate(
      {
        rules: input.map((r) => ({ minAge: r.minAge, maxAge: r.maxAge, gender: r.gender, courseId: r.courseId })),
      },
      { onSuccess: () => notify.success(savedText), onError: notify.error },
    );
  };

  // The coverage grid spans the program's ages plus any rule outside them
  const validAges = input.flatMap((r) => [r.minAge, r.maxAge]).filter((n) => Number.isInteger(n) && n >= 0);
  const from = Math.min(PROGRAM_AGES.from, ...validAges);
  const to = Math.min(Math.max(PROGRAM_AGES.to, ...validAges), from + 40);
  const ages = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const genders: { value: MatrixGender; label: string }[] = [
    { value: 'MALE', label: labels.boys },
    { value: 'FEMALE', label: labels.girls },
  ];

  if (isLoading) return <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />;
  if (error) {
    return (
      <Alert severity="error">
        <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      {readOnly && (
        <Alert severity="info">
          <FormattedMessage {...common.readOnly} values={{ permission: TrainingsPermission.configure }} />
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.help} />
      </Typography>

      <Section
        title={<FormattedMessage {...messages.rules} />}
        summary={dirty && <Chip size="small" color="warning" label={<FormattedMessage {...messages.unsaved} />} />}
        actions={
          !readOnly && (
            <Button size="small" startIcon={<AddIcon />} onClick={addRow}>
              <FormattedMessage {...messages.addRule} />
            </Button>
          )
        }
      >
        {rows.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            <FormattedMessage {...messages.noRules} />
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720, '& td': { borderBottom: 0, py: 0.75, px: 0.75 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }}>#</TableCell>
                  <TableCell sx={{ width: 110 }}>
                    <FormattedMessage {...messages.minAge} />
                  </TableCell>
                  <TableCell sx={{ width: 110 }}>
                    <FormattedMessage {...messages.maxAge} />
                  </TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <FormattedMessage {...messages.gender} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...common.course} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  const rowIssues = issues.filter((i) => i.index === index);
                  const bad = (code: string) => rowIssues.some((i) => i.code === code);
                  const ageError = bad('AGE_INVALID') || bad('AGE_ORDER') || bad('OVERLAP');
                  const selected = courseById.get(row.courseId);
                  return (
                    <TableRow key={row.key}>
                      <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                      {(['minAge', 'maxAge'] as const).map((name) => (
                        <TableCell key={name}>
                          <TextField
                            size="small"
                            fullWidth
                            value={row[name]}
                            onChange={(e) => setRow(row.key, { [name]: e.target.value })}
                            disabled={readOnly}
                            error={ageError}
                            slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': name } }}
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={row.gender}
                          onChange={(e) => setRow(row.key, { gender: e.target.value as Row['gender'] })}
                          disabled={readOnly}
                          error={bad('OVERLAP')}
                        >
                          <MenuItem value="BOTH">
                            <FormattedMessage {...common.both} />
                          </MenuItem>
                          <MenuItem value="MALE">{labels.boys}</MenuItem>
                          <MenuItem value="FEMALE">{labels.girls}</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={row.courseId}
                          onChange={(e) => setRow(row.key, { courseId: e.target.value })}
                          disabled={readOnly}
                          error={bad('COURSE_REQUIRED') || (!!selected && !selected.isActive)}
                        >
                          {courses
                            .filter((c) => c.isActive || c.id === row.courseId)
                            .map((c) => (
                              <MenuItem key={c.id} value={c.id}>
                                {c.isActive ? (
                                  `${c.code} · ${c.name}`
                                ) : (
                                  <FormattedMessage
                                    {...messages.inactiveCourse}
                                    values={{ name: `${c.code} · ${c.name}` }}
                                  />
                                )}
                              </MenuItem>
                            ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
                          <Typography variant="caption" color="error">
                            {rowIssues.map((issue) => (
                              <Box component="span" key={`${issue.code}-${issue.otherIndex}`} sx={{ display: 'block' }}>
                                <FormattedMessage
                                  {...messages[issue.code]}
                                  values={{ other: String((issue.otherIndex ?? 0) + 1) }}
                                />
                              </Box>
                            ))}
                          </Typography>
                          {!readOnly && (
                            <Tooltip title={<FormattedMessage {...common.remove} />}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
        {!readOnly && (
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button disabled={!dirty || replace.isPending} onClick={() => data?.data && setRows(toRows(data.data))}>
              <FormattedMessage {...messages.reset} />
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!dirty || issues.length > 0 || replace.isPending}
              startIcon={replace.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              <FormattedMessage {...common.save} />
            </Button>
          </Stack>
        )}
      </Section>

      <Section title={<FormattedMessage {...messages.coverage} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          <FormattedMessage {...messages.coverageHelp} />
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ '& td, & th': { px: 0.5, textAlign: 'center', whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ textAlign: 'left !important' }}>
                  <FormattedMessage {...messages.age} />
                </TableCell>
                {ages.map((age) => (
                  <TableCell key={age} sx={{ fontWeight: 600 }}>
                    {age}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {genders.map((g) => (
                <TableRow key={g.value}>
                  <TableCell sx={{ textAlign: 'left !important', fontWeight: 600 }}>{g.label}</TableCell>
                  {ages.map((age) => {
                    const matches = rulesFor(input, age, g.value);
                    const codes = matches.map((i) => courseById.get(input[i].courseId)?.code ?? '?');
                    return (
                      <TableCell
                        key={age}
                        sx={{
                          bgcolor: (theme) =>
                            matches.length > 1
                              ? theme.palette.error.light
                              : matches.length
                                ? alpha(theme.palette.primary.main, 0.12)
                                : theme.palette.grey[100],
                          color: matches.length > 1 ? 'error.contrastText' : 'text.primary',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          border: '1px solid',
                          borderColor: 'background.paper',
                        }}
                      >
                        {codes.join('/') || '·'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
          {genders.map((g) => {
            const missing = uncoveredAges(input, g.value, PROGRAM_AGES.from, PROGRAM_AGES.to);
            return missing.length ? (
              <Typography key={g.value} variant="body2" color="warning.dark">
                <FormattedMessage {...messages.uncovered} values={{ gender: g.label, ages: missing.join(', ') }} />
              </Typography>
            ) : null;
          })}
        </Stack>
      </Section>
    </Stack>
  );
}
