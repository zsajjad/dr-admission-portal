'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { Alert, Box, Stack, TextField, Typography } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import {
  Attempt,
  bestAttempt,
  EnrollmentDetail,
  useAssignTester,
  useCloseEnrollment,
  useOverrideMarks,
  useReassignTrainer,
  useReopenEnrollment,
} from '../../api/operations';
import { ActionDialog } from '../../components/ActionDialog';
import { ReasonField, reasonMissing } from '../../components/ReasonField';
import { StaffUserSelect } from '../../components/StaffUserSelect';
import { useNotify } from '../../components/useNotify';
import { bandFor, payoutFor, weightedPct } from '../../rules';
import { formatAmount, formatPct } from '../../utils';

import messages from './messages';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  enrollment: EnrollmentDetail;
}

/** Shared state for dialogs that need a reason */
function useReason(open: boolean) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (open) {
      setReason('');
      setSubmitted(false);
    }
  }, [open]);
  return { reason, setReason, submitted, setSubmitted, missing: reasonMissing(reason) };
}

function useDone(onClose: () => void) {
  const notify = useNotify();
  return {
    onSuccess: () => {
      notify.success();
      onClose();
    },
    onError: notify.error,
  };
}

/** Full reassignment: progress and the payout move to the new trainer */
export function ReassignTrainerDialog({ open, onClose, enrollment }: DialogProps) {
  const mutation = useReassignTrainer();
  const done = useDone(onClose);
  const r = useReason(open);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const same = trainerId === (enrollment.trainerStaffUserId ?? null);

  useEffect(() => {
    if (open) setTrainerId(null);
  }, [open]);

  const handleSubmit = () => {
    r.setSubmitted(true);
    if (r.missing || same) return;
    mutation.mutate({ id: enrollment.id, trainerStaffUserId: trainerId, reason: r.reason.trim() }, done);
  };

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      title={
        <FormattedMessage {...(enrollment.trainerStaffUserId ? messages.reassignTrainer : messages.assignTrainer)} />
      }
      submitLabel={
        <FormattedMessage {...(enrollment.trainerStaffUserId ? messages.reassignTrainer : messages.assignTrainer)} />
      }
    >
      <Stack spacing={2}>
        <Alert severity="warning">
          {enrollment.trainerStaffUserId ? (
            <FormattedMessage {...messages.reassignExplain} values={{ current: enrollment.trainerName ?? '--' }} />
          ) : (
            <FormattedMessage {...messages.reassignExplainNone} />
          )}
        </Alert>
        <StaffUserSelect
          role={StaffRole.TRAINER}
          label={<FormattedMessage {...messages.newTrainer} />}
          value={trainerId}
          onChange={setTrainerId}
          excludeIds={enrollment.trainerStaffUserId ? [enrollment.trainerStaffUserId] : []}
          error={r.submitted && same}
          helperText={
            r.submitted && same ? (
              <FormattedMessage {...messages.sameTrainer} />
            ) : (
              <FormattedMessage {...messages.noTrainer} />
            )
          }
        />
        <ReasonField value={r.reason} onChange={r.setReason} showError={r.submitted} />
      </Stack>
    </ActionDialog>
  );
}

/** The tester for the next attempt; never the trainer, now or before */
export function AssignTesterDialog({ open, onClose, enrollment }: DialogProps) {
  const mutation = useAssignTester();
  const done = useDone(onClose);
  const [testerId, setTesterId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setTesterId(enrollment.testerStaffUserId ?? null);
  }, [open, enrollment.testerStaffUserId]);

  // A tester can't grade their own trainee, including a past one
  const excludeIds = useMemo(() => {
    const ids = new Set<string>();
    if (enrollment.trainerStaffUserId) ids.add(enrollment.trainerStaffUserId);
    enrollment.assignments.forEach((a) => {
      if (a.fromTrainerStaffUserId) ids.add(a.fromTrainerStaffUserId);
      if (a.toTrainerStaffUserId) ids.add(a.toTrainerStaffUserId);
    });
    return [...ids];
  }, [enrollment]);

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      onSubmit={() => mutation.mutate({ id: enrollment.id, testerStaffUserId: testerId }, done)}
      isSubmitting={mutation.isPending}
      title={<FormattedMessage {...messages.assignTester} />}
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <StaffUserSelect
          role={StaffRole.TESTER}
          label={<FormattedMessage {...messages.nextTester} />}
          value={testerId}
          onChange={setTesterId}
          excludeIds={excludeIds}
          helperText={<FormattedMessage {...messages.testerHelp} />}
        />
      </Stack>
    </ActionDialog>
  );
}

/** Admin close: paid from the best attempt, nothing if never tested */
export function CloseEnrollmentDialog({ open, onClose, enrollment }: DialogProps) {
  const mutation = useCloseEnrollment();
  const done = useDone(onClose);
  const r = useReason(open);
  const best = bestAttempt(enrollment.attempts);

  const handleSubmit = () => {
    r.setSubmitted(true);
    if (r.missing) return;
    mutation.mutate({ id: enrollment.id, reason: r.reason.trim() }, done);
  };

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      title={<FormattedMessage {...messages.closeTitle} />}
      submitLabel={<FormattedMessage {...messages.close} />}
      submitColor="error"
    >
      <Stack spacing={2}>
        <Alert severity="warning">
          {best ? (
            <FormattedMessage
              {...messages.closeExplain}
              values={{ trainer: enrollment.trainerName ?? '--', amount: formatAmount(best.payout) }}
            />
          ) : (
            <FormattedMessage {...messages.closeExplainUntested} />
          )}
        </Alert>
        <ReasonField value={r.reason} onChange={r.setReason} showError={r.submitted} />
      </Stack>
    </ActionDialog>
  );
}

/** Reopen a closed enrollment so the trainer can decide again */
export function ReopenEnrollmentDialog({ open, onClose, enrollment }: DialogProps) {
  const mutation = useReopenEnrollment();
  const done = useDone(onClose);
  const r = useReason(open);

  const handleSubmit = () => {
    r.setSubmitted(true);
    if (r.missing) return;
    mutation.mutate({ id: enrollment.id, reason: r.reason.trim() }, done);
  };

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      title={<FormattedMessage {...messages.reopenTitle} />}
      submitLabel={<FormattedMessage {...messages.reopen} />}
      submitColor="warning"
    >
      <Stack spacing={2}>
        <Alert severity="info">
          <FormattedMessage {...messages.reopenExplain} />
        </Alert>
        <ReasonField value={r.reason} onChange={r.setReason} showError={r.submitted} />
      </Stack>
    </ActionDialog>
  );
}

const MARKS_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Change a submitted attempt's marks; shows the new result as the admin types */
export function OverrideMarksDialog({ open, onClose, enrollment, attempt }: DialogProps & { attempt: Attempt | null }) {
  const intl = useIntl();
  const mutation = useOverrideMarks();
  const done = useDone(onClose);
  const r = useReason(open);
  const noChange = useFormattedMessage(messages.noChange);
  const { trainings, payoutFloor, bands } = enrollment.rules;
  const ordered = useMemo(() => [...trainings].sort((a, b) => a.sortOrder - b.sortOrder), [trainings]);
  const [marks, setMarks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && attempt) setMarks(Object.fromEntries(attempt.marks.map((m) => [m.trainingId, String(m.marks)])));
  }, [open, attempt]);

  if (!attempt) return null;

  const invalid = (t: (typeof ordered)[number]) => {
    const v = marks[t.trainingId] ?? '';
    return !MARKS_PATTERN.test(v.trim()) || Number(v) > t.maxMarks;
  };
  const anyInvalid = ordered.some(invalid);
  const values = ordered.map((t) => Number(marks[t.trainingId]));
  const changed = attempt.marks.some((m) => Number(marks[m.trainingId]) !== m.marks);

  const preview = (() => {
    if (anyInvalid) return null;
    const pct = weightedPct(ordered, values);
    const passed = ordered.filter((t, i) => values[i] >= t.passMarks).length;
    const band = bandFor(bands, pct) ?? payoutFloor;
    return { pct, passed, band, payout: payoutFor(payoutFloor, band, passed, ordered.length) };
  })();

  const handleSubmit = () => {
    r.setSubmitted(true);
    if (r.missing || anyInvalid || !changed) return;
    mutation.mutate(
      {
        attemptId: attempt.attemptId,
        marks: ordered.map((t, i) => ({ trainingId: t.trainingId, marks: values[i] })),
        reason: r.reason.trim(),
      },
      done,
    );
  };

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      title={<FormattedMessage {...messages.overrideTitle} values={{ n: String(attempt.attemptNo) }} />}
      submitColor="warning"
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.overrideExplain} />
        </Typography>
        {enrollment.state === 'CLOSED' && (
          <Alert severity="warning">
            <FormattedMessage {...messages.overrideClosed} />
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {ordered.map((t) => (
            <TextField
              key={t.trainingId}
              size="small"
              label={`${t.code} · ${t.name}`}
              value={marks[t.trainingId] ?? ''}
              onChange={(e) => setMarks((m) => ({ ...m, [t.trainingId]: e.target.value }))}
              error={invalid(t)}
              helperText={
                invalid(t)
                  ? intl.formatMessage(messages.marksInvalid, { max: t.maxMarks })
                  : intl.formatMessage(messages.marksOutOf, { max: t.maxMarks, pass: t.passMarks })
              }
              slotProps={{ htmlInput: { inputMode: 'decimal', dir: 'ltr' } }}
            />
          ))}
        </Box>
        {preview && (
          <Alert severity={changed ? 'info' : 'success'} icon={false}>
            <FormattedMessage
              {...messages.newResult}
              values={{
                pct: formatPct(preview.pct),
                passed: String(preview.passed),
                total: String(ordered.length),
                band: formatAmount(preview.band),
                payout: formatAmount(preview.payout),
              }}
            />
          </Alert>
        )}
        {r.submitted && !changed && <Alert severity="warning">{noChange}</Alert>}
        <ReasonField value={r.reason} onChange={r.setReason} showError={r.submitted} />
      </Stack>
    </ActionDialog>
  );
}
