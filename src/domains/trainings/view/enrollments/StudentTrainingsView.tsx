'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useStudentsControllerGetProfile } from '@/providers/service/students/students';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  EnrollmentListItem,
  itemProgress,
  TrainingPass,
  useAddPass,
  useEnrollment,
  useRevokePass,
  useStudentTrainings,
} from '../../api/operations';
import { useCatalog } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { PayoutChip } from '../../components/PayoutChip';
import { ReasonField, reasonMissing } from '../../components/ReasonField';
import { StateChip } from '../../components/StateChip';
import { useSessions } from '../../components/useCurrentSession';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatAmount, formatDate, formatPct } from '../../utils';

import { EnrollDialog } from './EnrollDialog';
import messages from './messages';

function EnrollmentCard({ item }: { item: EnrollmentListItem }) {
  const { data } = useEnrollment(item.id);
  const e = data?.data;
  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {item.sessionName}
              </Typography>
              <StateChip state={item.state} closureReason={item.closureReason} />
              <PayoutChip status={item.payout.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {[
                item.trainerName,
                `${item.passedCount}/${item.trainingCount}`,
                item.payout.amount !== null ? formatAmount(item.payout.amount) : null,
                item.closedAt ? formatDate(item.closedAt) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
          <Button size="small" component={Link} href={routes.trainings.enrollment(item.id)}>
            <FormattedMessage {...messages.openEnrollment} />
          </Button>
        </Stack>
        {!e && <Skeleton height={60} />}
        {e && (
          <Table size="small" sx={{ mt: 1 }}>
            <TableBody>
              {e.trainings.map((t) => {
                const progress = itemProgress(t);
                return (
                  <TableRow key={t.trainingId}>
                    <TableCell>
                      {t.code} · {t.name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={progress === 'DONE' ? 'success' : progress === 'FAILED' ? 'error' : 'default'}
                        label={<FormattedMessage {...messages[`progress_${progress}`]} />}
                      />
                    </TableCell>
                    <TableCell align="right">{t.best ? formatPct(t.best.scorePct) : '--'}</TableCell>
                    <TableCell align="right">{formatAmount(t.payout)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/** Add a training pass by hand, e.g. from earlier records; it pays nobody */
function AddPassDialog({ open, onClose, studentId }: { open: boolean; onClose: () => void; studentId: string }) {
  const notify = useNotify();
  const add = useAddPass();
  const { data } = useCatalog();
  const [trainingId, setTrainingId] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (open) {
      setTrainingId('');
      setReason('');
      setSubmitted(false);
    }
  }, [open]);
  const handleSubmit = () => {
    setSubmitted(true);
    if (!trainingId || reasonMissing(reason)) return;
    add.mutate(
      { studentId, trainingId, reason: reason.trim() },
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
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={add.isPending}
      title={<FormattedMessage {...messages.addPass} />}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.addPassHelp} />
        </Typography>
        <TextField
          select
          size="small"
          label={<FormattedMessage {...common.training} />}
          value={trainingId}
          onChange={(e) => setTrainingId(e.target.value)}
          error={submitted && !trainingId}
        >
          {(data?.data ?? [])
            .filter((t) => t.isActive)
            .map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.code} · {t.name}
              </MenuItem>
            ))}
        </TextField>
        <ReasonField value={reason} onChange={setReason} showError={submitted} />
      </Stack>
    </ActionDialog>
  );
}

/** Revoke a pass; the training becomes required again */
function RevokePassDialog({ pass, onClose }: { pass: TrainingPass | null; onClose: () => void }) {
  const notify = useNotify();
  const revoke = useRevokePass();
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (pass) {
      setReason('');
      setSubmitted(false);
    }
  }, [pass]);
  const handleSubmit = () => {
    setSubmitted(true);
    if (!pass || reasonMissing(reason)) return;
    revoke.mutate(
      { id: pass.id, reason: reason.trim() },
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
      open={!!pass}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={revoke.isPending}
      submitColor="error"
      submitLabel={<FormattedMessage {...messages.revoke} />}
      title={<FormattedMessage {...messages.revokeTitle} values={{ training: pass?.code ?? pass?.name ?? '' }} />}
    >
      <Stack spacing={2}>
        <Alert severity="warning">
          <FormattedMessage {...messages.revokeHelp} />
        </Alert>
        <ReasonField value={reason} onChange={setReason} showError={submitted} />
      </Stack>
    </ActionDialog>
  );
}

/** A student's Fiqh trainings: what's required now, what's passed (any year), and every enrollment */
export function StudentTrainingsView({ studentId }: { studentId: string }) {
  const { canManage } = useTrainingsAccess();
  const { sessions } = useSessions();
  const [dialog, setDialog] = useState<'enroll' | 'pass' | null>(null);
  const [revoking, setRevoking] = useState<TrainingPass | null>(null);
  const { data: profileData } = useStudentsControllerGetProfile(studentId);
  const { student: trainings, isLoading, error } = useStudentTrainings(studentId);
  const student = profileData?.data?.student;
  const enrollments = [...(trainings?.enrollments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hasOpen = enrollments.some((e) => e.state !== 'CLOSED');

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {student ? `${student.name} · ${student.grNumber}` : <FormattedMessage {...messages.studentTrainings} />}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" component={Link} href={routes.students.profile(studentId)}>
            <FormattedMessage {...messages.openProfile} />
          </Button>
          {canManage && (
            <Button size="small" variant="outlined" onClick={() => setDialog('pass')}>
              <FormattedMessage {...messages.addPass} />
            </Button>
          )}
          {canManage && !hasOpen && !!trainings?.required.length && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setDialog('enroll')}>
              <FormattedMessage {...messages.enroll} />
            </Button>
          )}
        </Stack>
      </Stack>

      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}
      {isLoading && <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />}

      {trainings && (
        <Card sx={cardStyle}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              <FormattedMessage {...messages.requiredNow} values={{ age: String(trainings.age ?? '--') }} />
            </Typography>
            {trainings.required.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.nothingRequired} />
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {trainings.required.map((t) => (
                  <Chip key={t.trainingId} label={`${t.code} · ${t.name}`} />
                ))}
              </Stack>
            )}

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
              <FormattedMessage {...messages.passedTitle} />
            </Typography>
            {trainings.passed.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.noPasses} />
              </Typography>
            ) : (
              <Table size="small">
                <TableBody>
                  {trainings.passed.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{[p.code, p.name].filter(Boolean).join(' · ')}</TableCell>
                      <TableCell>{formatDate(p.passedAt)}</TableCell>
                      <TableCell>
                        {formatPct(p.scorePct)}
                        {p.improvable && (
                          <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ ml: 1 }}
                            label={<FormattedMessage {...messages.improvable} />}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {p.sessionName ?? sessions.find((x) => x.id === p.sessionId)?.name ?? p.sessionId ?? ''}
                      </TableCell>
                      <TableCell>
                        <FormattedMessage {...(p.source === 'ADMIN' ? messages.passByAdmin : messages.passByTest)} />
                        {p.reason ? ` · ${p.reason}` : ''}
                      </TableCell>
                      <TableCell align="right">
                        {canManage && (
                          <Button size="small" color="error" onClick={() => setRevoking(p)}>
                            <FormattedMessage {...messages.revoke} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && enrollments.length === 0 && (
        <Typography color="text.secondary">
          <FormattedMessage {...messages.studentTrainingsEmpty} />
        </Typography>
      )}
      {enrollments.map((e) => (
        <EnrollmentCard key={e.id} item={e} />
      ))}

      {canManage && (
        <>
          <EnrollDialog open={dialog === 'enroll'} onClose={() => setDialog(null)} studentId={studentId} />
          <AddPassDialog open={dialog === 'pass'} onClose={() => setDialog(null)} studentId={studentId} />
          <RevokePassDialog pass={revoking} onClose={() => setRevoking(null)} />
        </>
      )}
    </Stack>
  );
}

/** A small card for the student profile: what's passed and required, and a link to every year */
export function StudentTrainingsCard({ studentId }: { studentId: string }) {
  const { canRead } = useTrainingsAccess();
  const { student: trainings, isLoading } = useStudentTrainings(canRead ? studentId : undefined);
  if (!canRead) return null;
  const latest = [...(trainings?.enrollments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              <FormattedMessage {...messages.profileCard} />
            </Typography>
            {isLoading && <Skeleton width={160} />}
            {trainings && (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage
                  {...messages.profileCardSummary}
                  values={{ passed: String(trainings.passed.length), required: String(trainings.required.length) }}
                />
              </Typography>
            )}
            {latest && <StateChip state={latest.state} closureReason={latest.closureReason} />}
          </Stack>
          <Button size="small" component={Link} href={routes.trainings.student(studentId)}>
            <FormattedMessage {...messages.profileCardLink} />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
