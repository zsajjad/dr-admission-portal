'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import { Alert, Stack, TextField, Typography } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useEnroll } from '../../api/operations';
import { Recheck, RecheckRow, useOverrideRecheck } from '../../api/rechecks';
import { ActionDialog } from '../../components/ActionDialog';
import { ReasonField, reasonMissing } from '../../components/ReasonField';
import { StaffUserSelect } from '../../components/StaffUserSelect';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { gradeRecheck } from '../../rules';
import { formatPct } from '../../utils';

import messages from './messages';

const MARKS_PATTERN = /^\d+(\.\d{1,2})?$/;

/** What the override needs; `passMarks` is left out when unknown (then only the score is previewed) */
export type RecheckToOverride = Pick<
  Recheck,
  'recheckId' | 'code' | 'name' | 'marks' | 'maxMarks' | 'comment' | 'steps'
> & { passMarks?: number };

/** Change a recheck's marks (and the tester's comment), with a reason; shows the new result as the admin types */
export function OverrideRecheckDialog({
  recheck,
  onClose,
}: {
  recheck: RecheckToOverride | null;
  onClose: () => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const mutation = useOverrideRecheck();
  const noChange = useFormattedMessage(messages.noChange);
  const [marks, setMarks] = useState('');
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!recheck) return;
    setMarks(String(recheck.marks));
    setComment(recheck.comment ?? '');
    setReason('');
    setSubmitted(false);
  }, [recheck]);

  if (!recheck) return null;

  const value = Number(marks);
  const invalid = !MARKS_PATTERN.test(marks.trim()) || value > recheck.maxMarks;
  const commentChanged = comment.trim() !== (recheck.comment ?? '');
  const changed = (!invalid && value !== recheck.marks) || commentChanged;
  const preview = invalid
    ? null
    : recheck.passMarks === undefined
      ? { scorePct: gradeRecheck({ maxMarks: recheck.maxMarks, passMarks: 0 }, value).scorePct, passed: undefined }
      : gradeRecheck({ maxMarks: recheck.maxMarks, passMarks: recheck.passMarks }, value);

  const handleSubmit = () => {
    setSubmitted(true);
    if (invalid || reasonMissing(reason) || !changed) return;
    mutation.mutate(
      {
        id: recheck.recheckId,
        marks: value,
        reason: reason.trim(),
        ...(commentChanged && { comment: comment.trim() || null }),
      },
      {
        onSuccess: () => {
          notify.success();
          onClose();
        },
        onError: notify.error,
      },
    );
  };

  return (
    <ActionDialog
      open={!!recheck}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      submitColor="warning"
      title={
        <FormattedMessage
          {...messages.overrideTitle}
          values={{ training: [recheck.code, recheck.name].filter(Boolean).join(' · ') }}
        />
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.overrideExplain} />
        </Typography>
        <TextField
          size="small"
          label={<FormattedMessage {...messages.marks} />}
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          error={invalid}
          helperText={
            invalid
              ? intl.formatMessage(messages.marksInvalid, { max: recheck.maxMarks })
              : recheck.passMarks === undefined
                ? intl.formatMessage(messages.marksOutOfMax, { max: recheck.maxMarks })
                : intl.formatMessage(messages.marksOutOf, { max: recheck.maxMarks, pass: recheck.passMarks })
          }
          slotProps={{ htmlInput: { inputMode: 'decimal', dir: 'ltr' } }}
        />
        {!!recheck.steps?.length && (
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage {...messages.stepsKept} />
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label={<FormattedMessage {...messages.comment} />}
          helperText={<FormattedMessage {...messages.commentHelp} />}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
        {preview && (
          <Alert severity={preview.passed === false ? 'warning' : 'info'} icon={false}>
            {preview.passed === undefined ? (
              <FormattedMessage {...messages.newScore} values={{ pct: formatPct(preview.scorePct) }} />
            ) : (
              <FormattedMessage
                {...messages.newResult}
                values={{
                  pct: formatPct(preview.scorePct),
                  result: intl.formatMessage(preview.passed ? messages.passed : messages.failed),
                }}
              />
            )}
          </Alert>
        )}
        {submitted && !changed && <Alert severity="warning">{noChange}</Alert>}
        <ReasonField value={reason} onChange={setReason} showError={submitted} />
      </Stack>
    </ActionDialog>
  );
}

/**
 * Register a student whose recheck failed with a trainer: `POST /trainings/enrollments { grNumber, trainerStaffUserId }`.
 * The enrollment holds every training they need to train this session. Defaults to their last trainer.
 */
export function RegisterWithTrainerDialog({
  student,
  onClose,
}: {
  /** The student's waiting rows (one per failed recheck); null when closed */
  student: { grNumber: string; studentName: string; rows: RecheckRow[] } | null;
  onClose: () => void;
}) {
  const notify = useNotify();
  const enroll = useEnroll();
  const registered = useFormattedMessage(messages.registered);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const lastTrainer = student?.rows.find((r) => r.lastTrainerStaffUserId);

  useEffect(() => {
    if (!student) return;
    setTrainerId(student.rows.find((r) => r.lastTrainerStaffUserId)?.lastTrainerStaffUserId ?? null);
    setSubmitted(false);
  }, [student]);

  if (!student) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!trainerId) return;
    enroll.mutate(
      { grNumber: student.grNumber, trainerStaffUserId: trainerId },
      {
        onSuccess: () => {
          notify.success(registered);
          onClose();
        },
        onError: notify.error,
      },
    );
  };

  return (
    <ActionDialog
      open={!!student}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={enroll.isPending}
      submitLabel={<FormattedMessage {...messages.register} />}
      title={<FormattedMessage {...messages.registerTitle} values={{ name: student.studentName }} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage
            {...messages.registerExplain}
            values={{ trainings: student.rows.map((r) => `${r.code} · ${r.name}`).join(', ') }}
          />
        </Typography>
        {lastTrainer?.lastTrainerName && (
          <Alert severity="info" icon={false}>
            <FormattedMessage {...messages.registerDefault} values={{ name: lastTrainer.lastTrainerName }} />
          </Alert>
        )}
        <StaffUserSelect
          role={StaffRole.TRAINER}
          label={<FormattedMessage {...common.trainer} />}
          value={trainerId}
          onChange={setTrainerId}
          error={submitted && !trainerId}
          helperText={submitted && !trainerId ? <FormattedMessage {...messages.trainerRequired} /> : undefined}
        />
      </Stack>
    </ActionDialog>
  );
}
