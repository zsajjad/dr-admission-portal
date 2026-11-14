'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Badge as CardIcon,
  CheckCircle as PaidIcon,
  Class as ClassIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  FactCheck as StatusIcon,
  OpenInNew as OpenIcon,
  RemoveCircle as UnpaidIcon,
  TaskAlt as FinalizeIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import {
  useAdmissionsControllerFinalize,
  useAdmissionsControllerMarkFeePaid,
} from '@/providers/service/admissions/admissions';
import { Gender, StudentProfileAdmission } from '@/providers/service/app.schemas';
import { usePrintingControllerCreateCardPrintRequests } from '@/providers/service/printing/printing';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { ChangeClassDialog } from '../dialogs/ChangeClassDialog';
import { ChangeStatusDialog } from '../dialogs/ChangeStatusDialog';
import { ConfirmDialog } from '../dialogs/ConfirmDialog';
import { EditAdmissionDialog } from '../dialogs/EditAdmissionDialog';
import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';
import {
  admissionStatusColor,
  admissionStatusMessage,
  cardStyle,
  contrastText,
  formatDate,
  formatDateTime,
  vanEligibilityMessage,
} from '../utils';

import { AdmissionResultsSlot } from './AdmissionResultsSlot';
import { AdmissionSectionSlot } from './AdmissionSectionSlot';
import { AttendanceSummary } from './AttendanceSummary';
import { CardPrintHistory } from './CardPrintHistory';
import { Field } from './Field';
import { InterviewSummary } from './InterviewSummary';
import { MessageHistory } from './MessageHistory';

type DialogName = 'edit' | 'class' | 'status' | 'fee' | 'finalize' | 'card' | null;

interface AdmissionPanelProps {
  studentId: string;
  gender: Gender;
  admission: StudentProfileAdmission;
  isLatest: boolean;
}

/** One admission (one session): summary row, details, actions and history */
export function AdmissionPanel({ studentId, gender, admission, isLatest }: AdmissionPanelProps) {
  const [dialog, setDialog] = useState<DialogName>(null);
  const close = () => setDialog(null);
  const { onSuccess, onError } = useProfileActions(studentId);

  const feeMutation = useAdmissionsControllerMarkFeePaid();
  const finalizeMutation = useAdmissionsControllerFinalize();
  const cardMutation = usePrintingControllerCreateCardPrintRequests();

  const yes = useFormattedMessage(messages.yes);
  const no = useFormattedMessage(messages.no);
  const cardRequested = useFormattedMessage(messages.cardRequested);
  const cardAlreadyRequested = useFormattedMessage(messages.cardAlreadyRequested);
  const sessionValues = { session: admission.session.name };

  const a = admission;
  const attended = a.attendance.present + a.attendance.late;
  const canEdit = a.isActive;

  const handleFee = () =>
    feeMutation.mutate(
      { id: a.id, data: { isFeePaid: !a.isFeePaid } },
      {
        onSuccess: async () => {
          await onSuccess();
          close();
        },
        onError,
      },
    );

  const handleFinalize = () =>
    finalizeMutation.mutate(
      { id: a.id, data: { isFinalized: !a.isFinalized } },
      {
        onSuccess: async () => {
          await onSuccess();
          close();
        },
        onError,
      },
    );

  const handleCard = () =>
    cardMutation.mutate(
      { data: { admissionIds: [a.id] } },
      {
        onSuccess: async (res) => {
          await onSuccess(res.created > 0 ? cardRequested : cardAlreadyRequested);
          close();
        },
        onError,
      },
    );

  const byOn = (name?: string, date?: string) =>
    name ? <FormattedMessage {...messages.byOn} values={{ name, date: formatDateTime(date) }} /> : undefined;

  const vanValue = a.van ? (
    <Chip
      size="small"
      label={a.van.name}
      sx={{ bgcolor: a.van.colorHex, color: contrastText(a.van.colorHex), fontWeight: 600 }}
    />
  ) : (
    <FormattedMessage {...vanEligibilityMessage(a.vanEligibility)} />
  );

  return (
    <>
      <Accordion
        defaultExpanded={isLatest}
        disableGutters
        sx={{ ...cardStyle, '&:before': { display: 'none' }, overflow: 'hidden', opacity: a.isActive ? 1 : 0.75 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, py: 0.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 80 }}>
              {a.session.name}
            </Typography>
            {isLatest && a.isActive && (
              <Chip size="small" color="primary" label={<FormattedMessage {...messages.current} />} />
            )}
            {!a.isActive && <Chip size="small" label={<FormattedMessage {...messages.deactivated} />} />}
            <Chip
              size="small"
              color={admissionStatusColor(a.status)}
              label={<FormattedMessage {...admissionStatusMessage(a.status)} />}
            />
            <Chip
              size="small"
              variant={a.isFeePaid ? 'filled' : 'outlined'}
              color={a.isFeePaid ? 'success' : 'default'}
              label={<FormattedMessage {...(a.isFeePaid ? messages.feePaid : messages.feeUnpaid)} />}
            />
            <Typography variant="body2" color="text.secondary">
              {a.classLevel.name} · {a.branch.code} · {a.area.name}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {a.attendance.recordedDays > 0 && (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.attendance} />: {attended}/{a.attendance.totalDays}
              </Typography>
            )}
            {a.interview?.averageRating !== undefined && (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.interview} />: {a.interview.averageRating}/5
              </Typography>
            )}
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
          {/* Actions */}
          {canEdit && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Button
                size="small"
                variant={a.isFeePaid ? 'outlined' : 'contained'}
                color={a.isFeePaid ? 'warning' : 'success'}
                startIcon={a.isFeePaid ? <UnpaidIcon /> : <PaidIcon />}
                onClick={() => setDialog('fee')}
              >
                <FormattedMessage {...(a.isFeePaid ? messages.markFeeUnpaid : messages.markFeePaid)} />
              </Button>
              <Button size="small" variant="outlined" startIcon={<StatusIcon />} onClick={() => setDialog('status')}>
                <FormattedMessage {...messages.changeStatus} />
              </Button>
              <Button size="small" variant="outlined" startIcon={<ClassIcon />} onClick={() => setDialog('class')}>
                <FormattedMessage {...messages.changeClass} />
              </Button>
              <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setDialog('edit')}>
                <FormattedMessage {...messages.editAdmission} />
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FinalizeIcon />}
                onClick={() => setDialog('finalize')}
              >
                <FormattedMessage {...(a.isFinalized ? messages.undoFinalize : messages.finalize)} />
              </Button>
              <Button size="small" variant="outlined" startIcon={<CardIcon />} onClick={() => setDialog('card')}>
                <FormattedMessage {...messages.requestCard} />
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                size="small"
                component={Link}
                href={routes.admission.detail(a.id)}
                endIcon={<OpenIcon fontSize="small" />}
              >
                <FormattedMessage {...messages.openAdmission} />
              </Button>
            </Stack>
          )}

          {/* Details */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.branch} />} value={`${a.branch.name} (${a.branch.code})`} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.area} />} value={a.area.name} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.classLevel} />} value={a.classLevel.name} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field
                label={<FormattedMessage {...messages.status} />}
                value={<FormattedMessage {...admissionStatusMessage(a.status)} />}
                caption={a.rejectedReason}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field
                label={<FormattedMessage {...messages.fee} />}
                value={<FormattedMessage {...(a.isFeePaid ? messages.feePaid : messages.feeUnpaid)} />}
                caption={a.isFeePaid ? byOn(a.feePaidByAdmin?.name, a.feePaidAt) : undefined}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field
                label={<FormattedMessage {...messages.finalized} />}
                value={a.isFinalized ? yes : no}
                caption={a.isFinalized ? byOn(a.finalizedByAdmin?.name, a.finalizedAt) : undefined}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.van} />} value={vanValue} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.vanRequested} />} value={a.vanRequired ? yes : no} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field
                label={<FormattedMessage {...messages.school} />}
                value={[a.schoolName, a.schoolClass].filter(Boolean).join(', ') || undefined}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.lastYearClass} />} value={a.lastYearClass} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field
                label={<FormattedMessage {...messages.appliedOn} />}
                value={formatDate(a.createdAt)}
                caption={a.fromLegacyRecord ? <FormattedMessage {...messages.fromLegacyRecord} /> : undefined}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field
                label={<FormattedMessage {...messages.lastChangedBy} />}
                value={formatDateTime(a.updatedAt)}
                caption={a.updatedByAdmin?.name}
              />
            </Grid>
            {(a.isMarried || a.isWorking) && (
              <Grid size={{ xs: 6, md: 3 }}>
                <Field
                  label={
                    <>
                      <FormattedMessage {...messages.married} /> / <FormattedMessage {...messages.working} />
                    </>
                  }
                  value={`${a.isMarried ? yes : no} / ${a.isWorking ? yes : no}`}
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Section and results: slots for the parallel work */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <AdmissionSectionSlot admission={a} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <AdmissionResultsSlot admission={a} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InterviewSummary interview={a.interview} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AttendanceSummary attendance={a.attendance} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <CardPrintHistory cardPrints={a.cardPrints} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <MessageHistory items={a.messages} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Dialogs */}
      <EditAdmissionDialog open={dialog === 'edit'} studentId={studentId} admission={a} onClose={close} />
      <ChangeClassDialog
        open={dialog === 'class'}
        studentId={studentId}
        gender={gender}
        admission={a}
        onClose={close}
      />
      <ChangeStatusDialog open={dialog === 'status'} studentId={studentId} admission={a} onClose={close} />
      <ConfirmDialog
        open={dialog === 'fee'}
        title={<FormattedMessage {...(a.isFeePaid ? messages.markFeeUnpaid : messages.markFeePaid)} />}
        message={
          <FormattedMessage
            {...(a.isFeePaid ? messages.confirmFeeUnpaid : messages.confirmFeePaid)}
            values={sessionValues}
          />
        }
        confirmLabel={<FormattedMessage {...messages.confirm} />}
        confirmColor={a.isFeePaid ? 'warning' : 'success'}
        isSubmitting={feeMutation.isPending}
        onConfirm={handleFee}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog === 'finalize'}
        title={<FormattedMessage {...(a.isFinalized ? messages.undoFinalize : messages.finalize)} />}
        message={
          <FormattedMessage
            {...(a.isFinalized ? messages.confirmUndoFinalize : messages.confirmFinalize)}
            values={sessionValues}
          />
        }
        confirmLabel={<FormattedMessage {...messages.confirm} />}
        isSubmitting={finalizeMutation.isPending}
        onConfirm={handleFinalize}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog === 'card'}
        title={<FormattedMessage {...messages.requestCard} />}
        message={<FormattedMessage {...messages.confirmRequestCard} values={sessionValues} />}
        confirmLabel={<FormattedMessage {...messages.confirm} />}
        isSubmitting={cardMutation.isPending}
        onConfirm={handleCard}
        onClose={close}
      />
    </>
  );
}
