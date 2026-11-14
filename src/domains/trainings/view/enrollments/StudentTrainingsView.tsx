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
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useStudentsControllerGetProfile } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

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
import { Recheck, SessionTraining } from '../../api/rechecks';
import { useCatalog } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { PayoutChip } from '../../components/PayoutChip';
import { ReasonField, reasonMissing } from '../../components/ReasonField';
import { StateChip } from '../../components/StateChip';
import { useSessions } from '../../components/useCurrentSession';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { SessionStatus, sessionStatus } from '../../rules';
import { cardStyle, formatAmount, formatDate, formatPct } from '../../utils';
import rechecksMessages from '../rechecks/messages';
import { OverrideRecheckDialog, RecheckToOverride } from '../rechecks/RecheckDialogs';

import { EnrollDialog } from './EnrollDialog';
import messages from './messages';

const STATUS_COLOR: Record<SessionStatus, 'success' | 'info' | 'error' | 'warning' | 'default'> = {
  PASSED: 'success',
  RECHECK_DUE: 'info',
  RECHECK_FAILED: 'error',
  TO_TRAIN: 'warning',
  NOT_DUE: 'default',
};

const PASS_SOURCES = ['TRAINING', 'RECHECK', 'ADMIN', 'IMPORT_2026'] as const;
type PassSource = (typeof PASS_SOURCES)[number];
/** Where a pass came from: an attempt, a recheck, an admin or the 2026 results */
const passSource = (source: string) =>
  messages[`pass_${PASS_SOURCES.includes(source as PassSource) ? (source as PassSource) : 'TRAINING'}`];

/** A recheck's score: marks out of the maximum, and the % */
const recheckScore = (r: Pick<Recheck, 'marks' | 'maxMarks' | 'scorePct'>) =>
  `${r.marks}/${r.maxMarks} · ${formatPct(r.scorePct)}`;

/** Every training the student's age requires this session: its route (train or recheck) and where it stands */
function SessionTrainingsTable({ rows }: { rows: SessionTraining[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            <FormattedMessage {...common.training} />
          </TableCell>
          <TableCell>
            <FormattedMessage {...messages.route} />
          </TableCell>
          <TableCell>
            <FormattedMessage {...messages.standing} />
          </TableCell>
          <TableCell>
            <FormattedMessage {...messages.recheckThisSession} />
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((t) => {
          const status = sessionStatus(t);
          return (
            <TableRow key={t.trainingId}>
              <TableCell sx={{ fontWeight: 600 }}>
                {t.code} · {t.name}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  color={t.route === 'RECHECK' ? 'secondary' : 'primary'}
                  label={<FormattedMessage {...messages[`route_${t.route}`]} />}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={STATUS_COLOR[status]}
                  label={<FormattedMessage {...messages[`status_${status}`]} />}
                />
              </TableCell>
              <TableCell>
                {t.recheck ? (
                  <>
                    <Typography
                      variant="body2"
                      component="span"
                      color={t.recheck.passed ? 'success.dark' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {recheckScore(t.recheck)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {[formatDate(t.recheck.testedAt), t.recheck.comment].filter(Boolean).join(' · ')}
                    </Typography>
                  </>
                ) : (
                  '--'
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** Every recheck, any session, newest first; admins with the override permission can change marks */
function RechecksCard({
  rechecks,
  sessionName,
  passMarksOf,
  onOverride,
}: {
  rechecks: Recheck[];
  sessionName: (id: string) => string;
  passMarksOf: (trainingId: string) => number | undefined;
  onOverride?: (r: RecheckToOverride) => void;
}) {
  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          <FormattedMessage {...messages.rechecksTitle} />
        </Typography>
        {rechecks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.noRechecks} />
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableBody>
                {rechecks.map((r) => (
                  <TableRow key={r.recheckId}>
                    <TableCell sx={{ fontWeight: 600 }}>{[r.code, r.name].filter(Boolean).join(' · ')}</TableCell>
                    <TableCell>{sessionName(r.sessionId)}</TableCell>
                    <TableCell>{formatDate(r.testedAt)}</TableCell>
                    <TableCell>{recheckScore(r)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={r.passed ? 'success' : 'error'}
                        label={<FormattedMessage {...(r.passed ? rechecksMessages.passed : rechecksMessages.failed)} />}
                      />
                      {r.overridden && (
                        <Chip
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ ml: 1 }}
                          label={<FormattedMessage {...rechecksMessages.overridden} />}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="caption" color="text.secondary">
                        {r.comment ?? ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {onOverride && (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => onOverride({ ...r, passMarks: passMarksOf(r.trainingId) })}
                        >
                          <FormattedMessage {...rechecksMessages.overrideMarks} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/** Each training in an enrollment: progress, best score and (optionally) the payout */
function EnrollmentTrainingsTable({ enrollmentId, showPayout = true }: { enrollmentId: string; showPayout?: boolean }) {
  const { data } = useEnrollment(enrollmentId);
  const e = data?.data;
  if (!e) return <Skeleton height={60} />;
  return (
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
              {showPayout && <TableCell align="right">{formatAmount(t.payout)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function EnrollmentCard({ item }: { item: EnrollmentListItem }) {
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
        <EnrollmentTrainingsTable enrollmentId={item.id} />
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

/** Revoke a pass; the training's route this session and the session's result are worked out again */
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

/** A student's Fiqh trainings: this session's trainings and their routes, passes and rechecks (every session), and every enrollment */
export function StudentTrainingsView({ studentId }: { studentId: string }) {
  const { canManage, canOverride } = useTrainingsAccess();
  const { sessions } = useSessions();
  const { data: catalog } = useCatalog();
  const [dialog, setDialog] = useState<'enroll' | 'pass' | null>(null);
  const [revoking, setRevoking] = useState<TrainingPass | null>(null);
  const [overriding, setOverriding] = useState<RecheckToOverride | null>(null);
  const { data: profileData } = useStudentsControllerGetProfile(studentId);
  const { student: trainings, isLoading, error } = useStudentTrainings(studentId);
  const student = profileData?.data?.student;
  const enrollments = [...(trainings?.enrollments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hasOpen = enrollments.some((e) => e.state !== 'CLOSED');
  const sessionName = (id?: string | null) => sessions.find((x) => x.id === id)?.name ?? id ?? '';
  // This session's pass marks, else the catalog's (for the override preview)
  const passMarksOf = (trainingId: string) =>
    trainings?.trainings.find((t) => t.trainingId === trainingId)?.passMarks ??
    catalog?.data.find((t) => t.id === trainingId)?.passMarks;

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
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              <FormattedMessage {...messages.thisSession} values={{ age: String(trainings.age ?? '--') }} />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <FormattedMessage {...messages.thisSessionHelp} />
            </Typography>
            {trainings.requiredBlockedBy === 'NOT_ADMITTED' ? (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.notAdmitted} />
              </Typography>
            ) : trainings.trainings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.noneForAge} />
              </Typography>
            ) : (
              <SessionTrainingsTable rows={trainings.trainings} />
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
                      <TableCell>{formatPct(p.bestScorePct)}</TableCell>
                      <TableCell>{p.sessionName ?? sessionName(p.sessionId)}</TableCell>
                      <TableCell>
                        <FormattedMessage {...passSource(p.source)} />
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

      {trainings && (
        <RechecksCard
          rechecks={trainings.rechecks}
          sessionName={sessionName}
          passMarksOf={passMarksOf}
          onOverride={canOverride ? setOverriding : undefined}
        />
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
      {canOverride && <OverrideRecheckDialog recheck={overriding} onClose={() => setOverriding(null)} />}
    </Stack>
  );
}

/**
 * The student profile's trainings card: this session's enrollment (trainer, tester, each training's progress),
 * how this session's trainings stand (passed, rechecks due, to train), and a link to every year.
 */
export function StudentSessionTrainingsCard({ studentId, sessionId }: { studentId: string; sessionId?: string }) {
  const { student: trainings, isLoading } = useStudentTrainings(studentId);
  const trainerLabel = useFormattedMessage(common.trainer);
  const testerLabel = useFormattedMessage(common.tester);
  const enrollment = sessionId
    ? [...(trainings?.enrollments ?? [])]
        .filter((e) => e.sessionId === sessionId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : undefined;

  return (
    <Card sx={{ ...cardStyle, height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              <FormattedMessage {...messages.profileCardThisSession} />
            </Typography>
            {enrollment && <StateChip state={enrollment.state} closureReason={enrollment.closureReason} />}
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {enrollment && (
              <Button size="small" component={Link} href={routes.trainings.enrollment(enrollment.id)}>
                <FormattedMessage {...messages.openEnrollment} />
              </Button>
            )}
            <Button size="small" component={Link} href={routes.trainings.student(studentId)}>
              <FormattedMessage {...messages.profileCardLink} />
            </Button>
          </Stack>
        </Stack>

        {isLoading && <Skeleton variant="rounded" height={80} />}
        {trainings && (
          <Stack spacing={1}>
            {enrollment ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  {[
                    enrollment.trainerName && `${trainerLabel}: ${enrollment.trainerName}`,
                    enrollment.testerName && `${testerLabel}: ${enrollment.testerName}`,
                    `${enrollment.passedCount}/${enrollment.trainingCount}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
                <EnrollmentTrainingsTable enrollmentId={enrollment.id} showPayout={false} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.notEnrolledThisSession} />
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
              <FormattedMessage
                {...messages.profileCardSummary}
                values={{
                  passed: String(trainings.trainings.filter((t) => t.passedThisSession).length),
                  total: String(trainings.trainings.length),
                  rechecks: String(trainings.trainings.filter((t) => sessionStatus(t) === 'RECHECK_DUE').length),
                  required: String(trainings.required.length),
                }}
              />
            </Typography>
            {trainings.required.length > 0 && (
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                {trainings.required.map((t) => (
                  <Chip key={t.trainingId} size="small" variant="outlined" label={`${t.code} · ${t.name}`} />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
