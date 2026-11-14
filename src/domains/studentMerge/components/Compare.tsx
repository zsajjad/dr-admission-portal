'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import Link from 'next/link';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Radio,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';

import { SectionCard } from '@/domains/students/components/SectionCard';
import studentMessages from '@/domains/students/messages';
import { formatBirthDate, formatDate } from '@/domains/students/utils';

import {
  MergeAdmissionAction,
  MergeAdmissionItem,
  MergeConfidence,
  MergeFieldChoicesDto,
  MergeStudentSummary,
  PreviewStudentMergeDto,
} from '@/providers/service/app.schemas';
import {
  studentMergeControllerMerge,
  studentMergeControllerPreview,
} from '@/providers/service/student-merge/student-merge';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { maskField } from '../mask';
import messages from '../messages';

import { useOldGrs } from './OldGrs';

type Field = keyof MergeFieldChoicesDto | 'grNumber' | 'gender' | 'createdAt';

const FIELDS: { field: Field; label: keyof typeof messages }[] = [
  { field: 'grNumber', label: 'fieldGr' },
  { field: 'name', label: 'fieldName' },
  { field: 'fatherName', label: 'fieldFatherName' },
  { field: 'dateOfBirth', label: 'fieldDateOfBirth' },
  { field: 'gender', label: 'fieldGender' },
  { field: 'phone', label: 'fieldPhone' },
  { field: 'alternatePhone', label: 'fieldAlternatePhone' },
  { field: 'identityNumber', label: 'fieldIdentityNumber' },
  { field: 'address', label: 'fieldAddress' },
  { field: 'photoAssetId', label: 'fieldPhotoAssetId' },
  { field: 'identityProofAssetId', label: 'fieldIdentityProofAssetId' },
  { field: 'createdAt', label: 'fieldCreatedAt' },
];

const actionColor: Record<MergeAdmissionAction, 'default' | 'primary' | 'warning' | 'info'> = {
  STAY: 'default',
  MOVE: 'primary',
  RETIRE: 'warning',
  MOVE_INACTIVE: 'info',
};

interface CompareProps {
  firstId: string;
  secondId: string;
}

/**
 * Two records side by side through POST /admin/students/merge/preview: personal fields partly
 * hidden, differences highlighted for the admin to choose from, what happens to each admission, and the merge.
 */
export function Compare({ firstId, secondId }: CompareProps) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { show } = useSnackbarContext();

  // The GR rule picks the survivor; start with the first record and follow the rule's suggestion
  const [survivorId, setSurvivorId] = useState(firstId);
  const mergedId = survivorId === firstId ? secondId : firstId;
  const [choices, setChoices] = useState<MergeFieldChoicesDto>({});
  const [keepAdmissionId, setKeepAdmissionId] = useState<string | undefined>();
  const [confirmDob, setConfirmDob] = useState(false);
  const [force, setForce] = useState(false);
  const [forceReason, setForceReason] = useState('');
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState<MergeConfidence | ''>('');
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ survivorId: string; gr: string } | null>(null);

  useEffect(() => {
    setSurvivorId(firstId);
    setChoices({});
    setKeepAdmissionId(undefined);
    setConfirmDob(false);
    setForce(false);
    setDone(null);
  }, [firstId, secondId]);

  const body: PreviewStudentMergeDto = {
    survivorStudentId: survivorId,
    mergeStudentIds: [mergedId],
    ...(Object.keys(choices).length ? { fieldChoices: choices } : {}),
    ...(keepAdmissionId ? { keepAdmissionId } : {}),
    ...(confirmDob ? { confirmDobMismatch: true } : {}),
    ...(force ? { force: true } : {}),
  };
  const preview = useQuery({
    queryKey: ['merge-preview', body],
    queryFn: ({ signal }) => studentMergeControllerPreview(body, signal),
    enabled: !done,
    retry: false,
  });
  const p = preview.data?.data;

  useEffect(() => {
    if (
      p &&
      p.suggestedSurvivorStudentId !== survivorId &&
      [firstId, secondId].includes(p.suggestedSurvivorStudentId)
    ) {
      setSurvivorId(p.suggestedSurvivorStudentId);
      setChoices({});
      setKeepAdmissionId(undefined);
    }
  }, [p, survivorId, firstId, secondId]);

  const survivorOld = useOldGrs(p?.survivor.grNumber);
  const mergedOld = useOldGrs(p?.mergedStudents[0]?.grNumber);

  const differs = useMemo(() => new Map((p?.differences || []).map((d) => [d.field, d])), [p?.differences]);
  const codes = new Set([...(p?.blocking || []), ...(p?.warnings || [])].map((x) => x.code));

  // Sessions with more than one live admission: the admin names the one to keep
  const keepChoices = useMemo(() => {
    const live = (p?.admissions || []).filter((a) => a.isActive);
    const bySession = new Map<string, MergeAdmissionItem[]>();
    for (const a of live) bySession.set(a.sessionId, [...(bySession.get(a.sessionId) || []), a]);
    return new Set([...bySession.values()].filter((l) => l.length > 1).flatMap((l) => l.map((a) => a.id)));
  }, [p?.admissions]);

  if (preview.isLoading || (p && p.suggestedSurvivorStudentId !== survivorId && !preview.isError)) {
    return <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />;
  }
  if (done) {
    return (
      <Alert
        severity="success"
        action={
          <Button component={Link} href={routes.students.profile(done.survivorId)} size="small">
            <FormattedMessage {...messages.openProfile} />
          </Button>
        }
      >
        <FormattedMessage {...messages.merged} values={{ gr: done.gr }} />
      </Alert>
    );
  }
  if (preview.isError || !p) {
    return (
      <Alert severity="error">
        {extractNetworkError(preview.error) || <FormattedMessage {...messages.previewFailed} />}
      </Alert>
    );
  }

  const merged = p.mergedStudents[0];
  const value = (s: MergeStudentSummary | typeof p.finalStudent, field: Field): ReactNode => {
    const raw = (s as unknown as Record<string, unknown>)[field];
    if (raw === undefined || raw === null || raw === '') {
      return (
        <Typography variant="body2" color="text.disabled">
          <FormattedMessage {...messages.none} />
        </Typography>
      );
    }
    if (field === 'dateOfBirth') return formatBirthDate(String(raw));
    if (field === 'createdAt') return formatDate(String(raw));
    if (field === 'gender') {
      return <FormattedMessage {...(raw === 'FEMALE' ? studentMessages.female : studentMessages.male)} />;
    }
    if (field === 'photoAssetId' || field === 'identityProofAssetId') return <FormattedMessage {...messages.has} />;
    const text = String(raw);
    return revealed ? text : maskField(field, text);
  };

  const choose = (field: Field, studentId: string) => setChoices((c) => ({ ...c, [field]: studentId }));

  const cell = (s: MergeStudentSummary, field: Field) => {
    const diff = differs.get(field);
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {diff && (
          <Radio
            size="small"
            checked={diff.chosenStudentId === s.id}
            onChange={() => choose(field, s.id)}
            slotProps={{ input: { 'aria-label': `${field} from ${s.grNumber}` } }}
            sx={{ p: 0.25 }}
          />
        )}
        <Box sx={{ fontFamily: field === 'grNumber' ? 'monospace' : undefined, wordBreak: 'break-word' }}>
          {value(s, field)}
          {field === 'grNumber' && s.has2025Gr && (
            <Chip size="small" variant="outlined" sx={{ ml: 0.5 }} label={<FormattedMessage {...messages.gr2025} />} />
          )}
        </Box>
      </Stack>
    );
  };

  const submit = async () => {
    setTouched(true);
    if (!reason.trim() || (force && !forceReason.trim())) return;
    setPending(true);
    try {
      const res = await studentMergeControllerMerge({
        ...body,
        reason: reason.trim(),
        previewHash: p.previewHash,
        ...(force ? { forceReason: forceReason.trim() } : {}),
        ...(confidence ? { evidence: { confidence } } : {}),
      });
      await queryClient.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === 'string' &&
          (q.queryKey[0].startsWith('/admin/students') || q.queryKey[0].startsWith('/students')),
      });
      setDone({ survivorId: res.data.survivorStudentId, gr: res.data.survivorGrNumber });
    } catch (error) {
      const message = extractNetworkError(error) || intl.formatMessage(messages.failed);
      if (/PREVIEW_STALE|changed since/i.test(message)) {
        await preview.refetch();
        show({ message: intl.formatMessage(messages.stale), type: 'warning' });
      } else show({ message, type: 'error' });
    } finally {
      setPending(false);
    }
  };

  const highlight = (field: Field) => (t: { palette: { warning: { main: string } } }) =>
    differs.has(field) ? alpha(t.palette.warning.main, 0.08) : undefined;

  return (
    <Stack spacing={2}>
      <SectionCard
        title={<FormattedMessage {...messages.compareTitle} />}
        actions={
          <FormControlLabel
            control={<Switch size="small" checked={revealed} onChange={(e) => setRevealed(e.target.checked)} />}
            label={
              <Typography variant="body2">
                <FormattedMessage {...messages.showAll} />
              </Typography>
            }
          />
        }
      >
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <FormattedMessage {...messages.grRule} values={{ reason: p.primaryGrReason }} />
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage {...messages.masked} />
          {p.differences.length > 0 && (
            <>
              {' '}
              <FormattedMessage {...messages.pickValue} />
            </>
          )}
        </Typography>
        <Box sx={{ overflowX: 'auto', mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <FormattedMessage {...messages.keeps} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.mergedIn} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.result} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {FIELDS.map(({ field, label }) => (
                <TableRow key={field} sx={{ bgcolor: highlight(field) }}>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <FormattedMessage {...messages[label]} />
                  </TableCell>
                  <TableCell>{cell(p.survivor, field)}</TableCell>
                  <TableCell>{merged && cell(merged, field)}</TableCell>
                  <TableCell>
                    {field === 'createdAt' ? '' : value(field === 'gender' ? p.survivor : p.finalStudent, field)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  <FormattedMessage {...messages.fieldOldGrs} />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{survivorOld.join(', ') || '—'}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{mergedOld.join(', ') || '—'}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {[...new Set([...survivorOld, ...p.aliasesAdded, ...p.aliasesMoved, ...mergedOld])].join(', ')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </SectionCard>

      <SectionCard title={<FormattedMessage {...messages.admissions} />}>
        <Stack spacing={1}>
          {p.admissions.map((a) => (
            <Stack
              key={a.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
              sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 2 }}
            >
              {keepChoices.has(a.id) && (
                <FormControlLabel
                  control={
                    <Radio size="small" checked={keepAdmissionId === a.id} onChange={() => setKeepAdmissionId(a.id)} />
                  }
                  label={<FormattedMessage {...messages.keepThis} />}
                />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 140 }}>
                {a.sessionName}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {a.grNumber}
              </Typography>
              <Chip size="small" variant="outlined" label={a.status} />
              {!a.isActive && <Chip size="small" label={<FormattedMessage {...messages.inactive} />} />}
              {a.isFeePaid && (
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={<FormattedMessage {...messages.feePaid} />}
                />
              )}
              {a.hasInterview && (
                <Chip size="small" variant="outlined" label={<FormattedMessage {...messages.interviewed} />} />
              )}
              {a.cards.completed + a.cards.pending > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    <FormattedMessage
                      {...messages.cards}
                      values={{ count: String(a.cards.completed + a.cards.pending) }}
                    />
                  }
                />
              )}
              <Box sx={{ flex: 1 }} />
              <Chip
                size="small"
                color={actionColor[a.action]}
                label={<FormattedMessage {...messages[`action${a.action}`]} />}
              />
            </Stack>
          ))}
          <Typography variant="subtitle2" sx={{ pt: 1 }}>
            <FormattedMessage {...messages.whatHappens} />
          </Typography>
          {p.aliasesAdded.length > 0 && (
            <Typography variant="body2">
              <FormattedMessage
                {...messages.aliasesAdded}
                values={{ gr: p.finalStudent.grNumber, list: p.aliasesAdded.join(', ') }}
              />
            </Typography>
          )}
          {p.cardRequestsCancelled.length > 0 && (
            <Typography variant="body2">
              <FormattedMessage
                {...messages.cardsCancelled}
                values={{ count: String(p.cardRequestsCancelled.length) }}
              />
            </Typography>
          )}
        </Stack>
      </SectionCard>

      {p.blocking.length > 0 && (
        <Alert severity="error">
          <Typography variant="subtitle2">
            <FormattedMessage {...messages.blocking} />
          </Typography>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {p.blocking.map((x) => (
              <li key={x.code}>{x.message}</li>
            ))}
          </ul>
        </Alert>
      )}
      {p.warnings.length > 0 && (
        <Alert severity="warning">
          <Typography variant="subtitle2">
            <FormattedMessage {...messages.warnings} />
          </Typography>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {p.warnings.map((x) => (
              <li key={x.code}>{x.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      <SectionCard title={<FormattedMessage {...messages.merge} />}>
        <Stack spacing={2}>
          {codes.has('DOB_MISMATCH') && (
            <FormControlLabel
              control={<Checkbox checked={confirmDob} onChange={(e) => setConfirmDob(e.target.checked)} />}
              label={<FormattedMessage {...messages.confirmDob} />}
            />
          )}
          {codes.has('TWO_FEES_PAID') && (
            <>
              <FormControlLabel
                control={<Checkbox checked={force} onChange={(e) => setForce(e.target.checked)} />}
                label={<FormattedMessage {...messages.force} />}
              />
              {force && (
                <TextField
                  size="small"
                  required
                  label={<FormattedMessage {...messages.forceReason} />}
                  value={forceReason}
                  onChange={(e) => setForceReason(e.target.value)}
                  error={touched && !forceReason.trim()}
                />
              )}
            </>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={2}
              required
              label={<FormattedMessage {...messages.reason} />}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={touched && !reason.trim()}
              helperText={touched && !reason.trim() ? <FormattedMessage {...messages.reasonMissing} /> : undefined}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
            <TextField
              select
              size="small"
              sx={{ minWidth: 160 }}
              label={<FormattedMessage {...messages.confidence} />}
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as MergeConfidence | '')}
            >
              <MenuItem value="">
                <FormattedMessage {...messages.confidenceNone} />
              </MenuItem>
              {Object.values(MergeConfidence).map((c) => (
                <MenuItem key={c} value={c}>
                  <FormattedMessage {...messages[`confidence${c}`]} />
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Box>
            <Button
              variant="contained"
              color="warning"
              onClick={submit}
              disabled={pending || !p.canMerge || preview.isFetching}
              startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              <FormattedMessage {...messages.merge} />
            </Button>
          </Box>
        </Stack>
      </SectionCard>
    </Stack>
  );
}
