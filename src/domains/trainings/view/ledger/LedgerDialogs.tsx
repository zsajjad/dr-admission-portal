'use client';

import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import { useIntl } from 'react-intl';

import { Alert, Stack, TextField, Typography } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { LedgerEntry, TrainerTotals, useAddAdjustment, useRecordPayment, useVoidEntry } from '../../api/ledger';
import { ActionDialog } from '../../components/ActionDialog';
import { ReasonField } from '../../components/ReasonField';
import { StaffUserSelect } from '../../components/StaffUserSelect';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { formatAmount } from '../../utils';

import messages from './messages';

const WHOLE = /^-?\d+$/;

interface TrainerDialogProps {
  open: boolean;
  onClose: () => void;
  /** Start with this trainer picked */
  trainerId?: string | null;
  /** Totals, to show the balance due */
  totals?: TrainerTotals[];
}

function useClose(onClose: () => void) {
  const notify = useNotify();
  return {
    onSuccess: () => {
      notify.success();
      onClose();
    },
    onError: notify.error,
  };
}

/** Money sent to a trainer outside the system */
export function PaymentDialog({ open, onClose, trainerId: initialTrainer, totals = [] }: TrainerDialogProps) {
  const intl = useIntl();
  const mutation = useRecordPayment();
  const done = useClose(onClose);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTrainerId(initialTrainer ?? null);
    setAmount('');
    setPaidAt(format(new Date(), 'yyyy-MM-dd'));
    setReference('');
    setNote('');
    setSubmitted(false);
  }, [open, initialTrainer]);

  const due = totals.find((t) => t.trainer.id === trainerId)?.due;
  const amountOk = WHOLE.test(amount.trim()) && Number(amount) > 0;
  const valid = !!trainerId && amountOk && !!paidAt;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!valid || !trainerId) return;
    mutation.mutate(
      {
        trainerStaffUserId: trainerId,
        amount: Number(amount),
        paidAt: new Date(`${paidAt}T12:00:00`).toISOString(),
        ...(reference.trim() && { reference: reference.trim() }),
        ...(note.trim() && { note: note.trim() }),
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
      title={<FormattedMessage {...messages.paymentTitle} />}
      submitLabel={<FormattedMessage {...messages.recordPayment} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.paymentExplain} />
        </Typography>
        <StaffUserSelect
          role={StaffRole.TRAINER}
          label={<FormattedMessage {...common.trainer} />}
          value={trainerId}
          onChange={setTrainerId}
          error={submitted && !trainerId}
          helperText={due !== undefined ? intl.formatMessage(messages.dueNow, { due: formatAmount(due) }) : undefined}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.amountRs} />}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={submitted && !amountOk}
            helperText={submitted && !amountOk ? intl.formatMessage(messages.amountPositive) : undefined}
            slotProps={{ htmlInput: { inputMode: 'numeric', dir: 'ltr' } }}
          />
          <TextField
            size="small"
            fullWidth
            type="date"
            label={<FormattedMessage {...messages.paidAt} />}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            error={submitted && !paidAt}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
        {due !== undefined && amountOk && Number(amount) > due && (
          <Alert severity="warning">
            <FormattedMessage {...messages.moreThanDue} values={{ due: formatAmount(due) }} />
          </Alert>
        )}
        <TextField
          size="small"
          label={<FormattedMessage {...messages.reference} />}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
        <TextField
          size="small"
          multiline
          minRows={2}
          label={<FormattedMessage {...messages.note} />}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Stack>
    </ActionDialog>
  );
}

/** A correction to a trainer's earnings, approved when made */
export function AdjustmentDialog({
  open,
  onClose,
  trainerId: initialTrainer,
  enrollmentId: initialEnrollment,
}: TrainerDialogProps & { enrollmentId?: string }) {
  const intl = useIntl();
  const mutation = useAddAdjustment();
  const done = useClose(onClose);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTrainerId(initialTrainer ?? null);
    setAmount('');
    setEnrollmentId(initialEnrollment ?? '');
    setReason('');
    setSubmitted(false);
  }, [open, initialTrainer, initialEnrollment]);

  const amountOk = WHOLE.test(amount.trim()) && Number(amount) !== 0;
  const valid = !!trainerId && amountOk && !!reason.trim();

  const handleSubmit = () => {
    setSubmitted(true);
    if (!valid || !trainerId) return;
    mutation.mutate(
      {
        trainerStaffUserId: trainerId,
        amount: Number(amount),
        reason: reason.trim(),
        ...(enrollmentId.trim() && { enrollmentId: enrollmentId.trim() }),
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
      title={<FormattedMessage {...messages.adjustmentTitle} />}
      submitLabel={<FormattedMessage {...messages.addAdjustment} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.adjustmentExplain} />
        </Typography>
        <StaffUserSelect
          role={StaffRole.TRAINER}
          label={<FormattedMessage {...common.trainer} />}
          value={trainerId}
          onChange={setTrainerId}
          error={submitted && !trainerId}
        />
        <TextField
          size="small"
          label={<FormattedMessage {...messages.amountRs} />}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={submitted && !amountOk}
          helperText={intl.formatMessage(messages.amountNonZero)}
          slotProps={{ htmlInput: { inputMode: 'numeric', dir: 'ltr' } }}
        />
        <TextField
          size="small"
          label={<FormattedMessage {...messages.enrollmentId} />}
          value={enrollmentId}
          onChange={(e) => setEnrollmentId(e.target.value)}
          slotProps={{ htmlInput: { dir: 'ltr' } }}
        />
        <ReasonField value={reason} onChange={setReason} showError={submitted} />
      </Stack>
    </ActionDialog>
  );
}

/** Void a payment or an adjustment, with a reason */
export function VoidDialog({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  const intl = useIntl();
  const mutation = useVoidEntry();
  const done = useClose(onClose);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (entry) {
      setReason('');
      setSubmitted(false);
    }
  }, [entry]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!entry || !reason.trim()) return;
    mutation.mutate({ id: entry.id, reason: reason.trim() }, done);
  };

  return (
    <ActionDialog
      open={!!entry}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      title={
        entry ? (
          <FormattedMessage
            {...messages.voidTitle}
            values={{ kind: intl.formatMessage(common[entry.kind]).toLowerCase(), amount: formatAmount(entry.amount) }}
          />
        ) : null
      }
      submitLabel={<FormattedMessage {...messages.void} />}
      submitColor="error"
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.voidExplain} />
        </Typography>
        <ReasonField value={reason} onChange={setReason} showError={submitted} />
      </Stack>
    </ActionDialog>
  );
}
