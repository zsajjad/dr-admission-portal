'use client';

import { ReactNode, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { CheckCircle as DoneIcon, Flag as FlagIcon, RadioButtonUnchecked as PendingIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { DataNotFound } from '@/components/DataNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { Attempt, bestAttempt, EnrollmentDetail, useEnrollment, useEnrollmentLedger } from '../../api/operations';
import { useWindows } from '../../api/setup';
import { LedgerKindLabel, LedgerStatusChip } from '../../components/LedgerChips';
import { PayoutChip } from '../../components/PayoutChip';
import { Section } from '../../components/Section';
import { useStaffNames } from '../../components/StaffUserSelect';
import { StateChip } from '../../components/StateChip';
import { useSessions } from '../../components/useCurrentSession';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatAmount, formatDate, formatDateTime, formatPct } from '../../utils';
import { PayoutPreview } from '../courses/PayoutPreview';

import {
  AssignTesterDialog,
  CloseEnrollmentDialog,
  OverrideMarksDialog,
  ReassignTrainerDialog,
  ReopenEnrollmentDialog,
} from './EnrollmentDialogs';
import messages from './messages';

type DialogName = 'trainer' | 'tester' | 'close' | 'reopen';

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>
        {children}
      </Typography>
    </Box>
  );
}

/** Everything about one enrollment, and the admin actions on it */
export function EnrollmentDetailView({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useEnrollment(enrollmentId);
  const notFound = useFormattedMessage(common.loadError);
  const enrollment = data?.data;

  if (isLoading) return <DetailSkeleton />;
  if (!enrollment) {
    return error ? (
      <Alert severity="error">
        <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
      </Alert>
    ) : (
      <DataNotFound notFoundMessage={notFound} />
    );
  }
  return <EnrollmentDetailBody enrollment={enrollment} />;
}

const DECISION_KINDS = ['RETRAIN', 'CLOSE', 'AUTO_CLOSE', 'ADMIN_CLOSE', 'REOPEN'] as const;

export function EnrollmentDetailBody({ enrollment: e }: { enrollment: EnrollmentDetail }) {
  const intl = useIntl();
  const { canManage, canOverride } = useTrainingsAccess();
  const staffName = useStaffNames();
  const { sessions } = useSessions();
  const { data: windowsData } = useWindows({ sessionId: e.sessionId, take: 100 });
  const { data: ledgerData } = useEnrollmentLedger(e.id);
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [overriding, setOverriding] = useState<Attempt | null>(null);

  const closed = e.state === 'CLOSED';
  const trainings = useMemo(() => [...e.rules.trainings].sort((a, b) => a.sortOrder - b.sortOrder), [e.rules]);
  const attempts = [...e.attempts].sort((a, b) => a.attemptNo - b.attemptNo);
  const best = bestAttempt(e.attempts);
  const windowName = (id?: string) => windowsData?.data.find((w) => w.id === id)?.name;
  const sessionName = sessions.find((s) => s.id === e.sessionId)?.name ?? e.sessionId;
  const ledger = ledgerData?.data ?? [];
  const actor = (type: string, staffUserId?: string) =>
    type === 'SYSTEM'
      ? intl.formatMessage(common.system)
      : type === 'ADMIN'
        ? intl.formatMessage(common.admin)
        : (staffName(staffUserId) ?? '--');
  const unassigned = intl.formatMessage(common.unassigned);
  const reopenFirst = intl.formatMessage(messages.reopenFirst);

  return (
    <Stack spacing={2.5}>
      {/* Summary */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {e.name}
                </Typography>
                <Chip size="small" variant="outlined" label={e.grNumber} sx={{ fontFamily: 'monospace' }} />
                <StateChip state={e.state} closureReason={e.closureReason} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {[e.fatherName, e.classLevelCode, e.branchCode].filter(Boolean).join(' · ')}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button size="small" component={Link} href={routes.students.profile(e.studentId)}>
                  <FormattedMessage {...messages.openProfile} />
                </Button>
                <Button size="small" component={Link} href={routes.trainings.student(e.studentId)}>
                  <FormattedMessage {...messages.allTrainings} />
                </Button>
              </Stack>
            </Box>
            {canManage && (
              <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                <Tooltip title={closed ? reopenFirst : ''}>
                  <span>
                    <Button variant="outlined" size="small" disabled={closed} onClick={() => setDialog('trainer')}>
                      <FormattedMessage
                        {...(e.trainerStaffUserId ? messages.reassignTrainer : messages.assignTrainer)}
                      />
                    </Button>
                  </span>
                </Tooltip>
                <Button variant="outlined" size="small" disabled={closed} onClick={() => setDialog('tester')}>
                  <FormattedMessage {...messages.assignTester} />
                </Button>
                {closed ? (
                  <Button variant="contained" color="warning" size="small" onClick={() => setDialog('reopen')}>
                    <FormattedMessage {...messages.reopen} />
                  </Button>
                ) : (
                  <Button variant="contained" color="error" size="small" onClick={() => setDialog('close')}>
                    <FormattedMessage {...messages.close} />
                  </Button>
                )}
              </Stack>
            )}
          </Stack>

          <Grid container spacing={2} sx={{ mt: 1.5 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...common.course} />}>
                {e.course.code} · {e.course.name}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...common.session} />}>
                {sessionName}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <FormattedMessage
                    {...messages.enrolledOn}
                    values={{ date: formatDate(e.createdAt), age: String(e.ageAtEnrollment ?? '--') }}
                  />
                </Typography>
                {e.repeatReason && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    <FormattedMessage {...messages.repeatReason} values={{ reason: e.repeatReason }} />
                  </Typography>
                )}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...common.trainer} />}>
                {e.trainerName ?? (
                  <Typography component="span" variant="body2" color="warning.dark">
                    {unassigned}
                  </Typography>
                )}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.nextTester} />}>
                {staffName(e.testerStaffUserId) ?? <FormattedMessage {...messages.anyTester} />}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.attempts} />}>
                <FormattedMessage
                  {...messages.attemptsOf}
                  values={{ used: String(e.attemptsUsed), max: String(e.rules.maxAttempts) }}
                />
                {' · '}
                <FormattedMessage {...messages.round} values={{ round: String(e.round) }} />
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.bestPct} />}>{formatPct(e.bestPct)}</Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.payout} />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{formatAmount(e.payout.amount)}</span>
                  <PayoutChip status={e.payout.status} />
                </Stack>
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {closed ? (
                <Field label={<FormattedMessage {...messages.closedOn} values={{ date: formatDate(e.closedAt) }} />}>
                  <FormattedMessage {...(e.passed ? messages.passedYes : messages.passedNo)} />
                </Field>
              ) : (
                <Field label={<FormattedMessage {...messages.autoCloseAt} />}>{formatDateTime(e.autoCloseAt)}</Field>
              )}
            </Grid>
          </Grid>

          {e.decision && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <FormattedMessage
                {...(e.decision.suggested === 'RETRAIN' ? messages.decisionDueRetrain : messages.decisionDue)}
                values={{
                  n: String(e.decision.attemptNo),
                  now: formatAmount(e.decision.payoutNow),
                  ifAllPass: formatAmount(e.decision.payoutIfAllPass),
                  max: formatAmount(e.decision.payoutMax),
                }}
              />
            </Alert>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {/* Progress in the current round */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Section
            title={<FormattedMessage {...messages.progress} />}
            summary={
              <Chip size="small" label={<FormattedMessage {...messages.round} values={{ round: String(e.round) }} />} />
            }
          >
            <Table size="small">
              <TableBody>
                {e.trainings.map((t) => (
                  <TableRow key={t.trainingId}>
                    <TableCell>
                      {t.code} · {t.name}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                        <Typography variant="caption" color="text.secondary">
                          {t.completed ? formatDateTime(t.completedAt) : ''}
                        </Typography>
                        {t.completed ? (
                          <DoneIcon fontSize="small" color="success" />
                        ) : (
                          <PendingIcon fontSize="small" color="disabled" />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </Grid>

        {/* Rules snapshot */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Section title={<FormattedMessage {...messages.rulesTitle} />}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <FormattedMessage
                {...messages.rulesHelp}
                values={{
                  threshold: String(e.rules.retrainThresholdPct),
                  attempts: String(e.rules.maxAttempts),
                  days: String(e.rules.autoCloseDays),
                }}
              />
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {trainings
                .map((t) => `${t.code} ${formatPct(t.weightPct)} (pass ${t.passMarks}/${t.maxMarks})`)
                .join(' · ')}
            </Typography>
            <PayoutPreview floor={e.rules.payoutFloor} bands={e.rules.bands} totalTrainings={trainings.length} />
          </Section>
        </Grid>

        {/* Attempts */}
        <Grid size={12}>
          <Section title={<FormattedMessage {...messages.attemptsTitle} />}>
            {attempts.length === 0 ? (
              <Typography color="text.secondary">
                <FormattedMessage {...messages.noAttempts} />
              </Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      {trainings.map((t) => (
                        <TableCell key={t.trainingId} align="right">
                          {t.code}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <FormattedMessage {...messages.weightedPct} />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage {...messages.passedCount} />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage {...messages.band} />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage {...messages.payout} />
                      </TableCell>
                      {canOverride && <TableCell />}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attempts.map((a) => {
                      const wrongSteps = a.marks.flatMap((m) =>
                        (m.steps ?? [])
                          .filter((s) => !s.correct)
                          .map((s) => `${trainings.find((t) => t.trainingId === m.trainingId)?.code}: ${s.stepCode}`),
                      );
                      return (
                        <TableRow key={a.attemptId} sx={{ verticalAlign: 'top' }}>
                          <TableCell sx={{ minWidth: 260 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <FormattedMessage {...messages.attemptNo} values={{ n: String(a.attemptNo) }} />
                              </Typography>
                              {best?.attemptId === a.attemptId && (
                                <Chip size="small" color="success" label={<FormattedMessage {...messages.best} />} />
                              )}
                              {a.lateGrade && (
                                <Tooltip title={intl.formatMessage(messages.flag_LATE_GRADE)}>
                                  <Chip
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    icon={<FlagIcon />}
                                    label={<FormattedMessage {...messages.lateGrade} />}
                                  />
                                </Tooltip>
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              <FormattedMessage
                                {...messages.testedBy}
                                values={{ name: staffName(a.testerStaffUserId) ?? '--' }}
                              />
                              {a.windowId && (
                                <>
                                  {' '}
                                  <FormattedMessage
                                    {...messages.inWindow}
                                    values={{ window: windowName(a.windowId) ?? '--' }}
                                  />
                                </>
                              )}
                              {' · '}
                              {formatDateTime(a.testedAt)}
                            </Typography>
                            {a.overridden && (
                              <Typography variant="caption" color="warning.dark" sx={{ display: 'block' }}>
                                <FormattedMessage
                                  {...messages.overridden}
                                  values={{
                                    name: intl.formatMessage(common.admin),
                                    at: formatDateTime(a.overriddenAt),
                                    reason: a.overrideReason ?? '',
                                  }}
                                />
                              </Typography>
                            )}
                            {wrongSteps.length > 0 && (
                              <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                                <FormattedMessage {...messages.wrongSteps} values={{ steps: wrongSteps.join(', ') }} />
                              </Typography>
                            )}
                          </TableCell>
                          {trainings.map((t) => {
                            const m = a.marks.find((x) => x.trainingId === t.trainingId);
                            return (
                              <TableCell
                                key={t.trainingId}
                                align="right"
                                sx={{ color: m && !m.passed ? 'error.main' : 'text.primary', fontWeight: 600 }}
                              >
                                {m?.marks ?? '--'}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right">{formatPct(a.weightedPct)}</TableCell>
                          <TableCell align="right">
                            {a.passedCount}/{a.totalCount}
                          </TableCell>
                          <TableCell align="right">{formatAmount(a.band)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatAmount(a.payout)}
                          </TableCell>
                          {canOverride && (
                            <TableCell align="right">
                              <Button size="small" color="warning" onClick={() => setOverriding(a)}>
                                <FormattedMessage {...messages.overrideMarks} />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Section>
        </Grid>

        {/* Decisions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title={<FormattedMessage {...messages.decisions} />}>
            {e.decisions.length === 0 ? (
              <Typography color="text.secondary">
                <FormattedMessage {...messages.noDecisions} />
              </Typography>
            ) : (
              <Table size="small">
                <TableBody>
                  {[...e.decisions]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((d, i) => {
                      const kind = DECISION_KINDS.find((k) => k === d.decision);
                      return (
                        <TableRow key={`${d.createdAt}-${i}`}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDateTime(d.clientTime ?? d.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {kind ? <FormattedMessage {...common[kind]} /> : d.decision}
                              {d.attemptNo && (
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {' '}
                                  <FormattedMessage {...messages.afterAttempt} values={{ n: String(d.attemptNo) }} />
                                </Typography>
                              )}
                            </Typography>
                            {d.reason && (
                              <Typography variant="caption" color="text.secondary">
                                {d.reason}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{actor(d.actorType, d.staffUserId)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </Section>
        </Grid>

        {/* Trainer history */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title={<FormattedMessage {...messages.assignments} />}>
            {e.assignments.length === 0 ? (
              <Typography color="text.secondary">
                <FormattedMessage {...messages.noAssignments} />
              </Typography>
            ) : (
              <Table size="small">
                <TableBody>
                  {[...e.assignments]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((a, i) => (
                      <TableRow key={`${a.createdAt}-${i}`}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(a.createdAt)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            <FormattedMessage
                              {...messages.fromTo}
                              values={{
                                from: staffName(a.fromTrainerStaffUserId) ?? unassigned,
                                to: staffName(a.toTrainerStaffUserId) ?? unassigned,
                              }}
                            />
                          </Typography>
                          {a.reason && (
                            <Typography variant="caption" color="text.secondary">
                              {a.reason}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{a.byAdminUserId ? actor('ADMIN') : actor('STAFF', a.byStaffUserId)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </Grid>

        {/* Ledger */}
        <Grid size={12}>
          <Section title={<FormattedMessage {...messages.ledger} />}>
            {ledger.length === 0 ? (
              <Typography color="text.secondary">
                <FormattedMessage {...messages.noLedger} />
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage {...messages.when} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.kind} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...common.trainer} />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage {...messages.amount} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...messages.status} />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage {...common.reason} />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledger.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(l.createdAt)}</TableCell>
                      <TableCell>
                        <LedgerKindLabel kind={l.kind} />
                      </TableCell>
                      <TableCell>{staffName(l.trainerStaffUserId)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatAmount(l.amount)}
                      </TableCell>
                      <TableCell>
                        <LedgerStatusChip status={l.status} />
                      </TableCell>
                      <TableCell>{l.reason ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </Grid>
      </Grid>

      {canManage && (
        <>
          <ReassignTrainerDialog open={dialog === 'trainer'} onClose={() => setDialog(null)} enrollment={e} />
          <AssignTesterDialog open={dialog === 'tester'} onClose={() => setDialog(null)} enrollment={e} />
          <CloseEnrollmentDialog open={dialog === 'close'} onClose={() => setDialog(null)} enrollment={e} />
          <ReopenEnrollmentDialog open={dialog === 'reopen'} onClose={() => setDialog(null)} enrollment={e} />
        </>
      )}
      {canOverride && (
        <OverrideMarksDialog
          open={!!overriding}
          onClose={() => setOverriding(null)}
          enrollment={e}
          attempt={overriding}
        />
      )}
    </Stack>
  );
}
