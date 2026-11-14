'use client';

import { ReactNode, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Flag as FlagIcon } from '@mui/icons-material';
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

import { Attempt, EnrollmentDetail, ItemProgress, itemProgress, useEnrollment } from '../../api/operations';
import { useWindows } from '../../api/setup';
import { LedgerKindLabel, LedgerStatusChip } from '../../components/LedgerChips';
import { PayoutChip } from '../../components/PayoutChip';
import { Section } from '../../components/Section';
import { StateChip } from '../../components/StateChip';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatAmount, formatDate, formatDateTime, formatPct } from '../../utils';

import {
  AssignTesterDialog,
  CloseEnrollmentDialog,
  OverrideMarksDialog,
  ReassignTrainerDialog,
  ReopenEnrollmentDialog,
} from './EnrollmentDialogs';
import messages from './messages';

type DialogName = 'trainer' | 'tester' | 'close' | 'reopen';

const PROGRESS_COLOR: Record<ItemProgress, 'success' | 'info' | 'error' | 'default'> = {
  DONE: 'success',
  CAN_RETRAIN: 'info',
  FAILED: 'error',
  PENDING: 'default',
};

const DECISION_KINDS = ['RETRAIN', 'CLOSE', 'AUTO_CLOSE', 'ADMIN_CLOSE', 'REOPEN'] as const;

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

export function EnrollmentDetailBody({ enrollment: e }: { enrollment: EnrollmentDetail }) {
  const intl = useIntl();
  const { canManage, canOverride } = useTrainingsAccess();
  const { data: windowsData } = useWindows({ sessionId: e.sessionId, take: 100 });
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [overriding, setOverriding] = useState<Attempt | null>(null);

  const closed = e.state === 'CLOSED';
  const rules = useMemo(() => [...e.rules.trainings].sort((a, b) => a.sortOrder - b.sortOrder), [e.rules]);
  const code = (id: string) => rules.find((t) => t.trainingId === id)?.code ?? id;
  const attempts = [...e.attempts].sort((a, b) => a.attemptNo - b.attemptNo);
  const windowName = (id?: string) => windowsData?.data.find((w) => w.id === id)?.name;
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
                {[
                  e.fatherName,
                  intl.formatMessage(e.gender === 'FEMALE' ? common.girls : common.boys),
                  e.classLevelCode,
                  e.branchCode,
                  e.areaName,
                ]
                  .filter(Boolean)
                  .join(' · ')}
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
              <Field label={<FormattedMessage {...common.session} />}>
                {e.sessionName}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <FormattedMessage
                    {...messages.enrolledOn}
                    values={{ date: formatDate(e.createdAt), age: String(e.ageAtEnrollment ?? '--') }}
                  />
                </Typography>
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
                {e.testerName ?? <FormattedMessage {...messages.anyTester} />}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.trainingsPassed} />}>
                {e.passedCount} / {e.trainingCount}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.attempts} />}>
                <FormattedMessage
                  {...messages.attemptsOf}
                  values={{ used: String(e.attemptsUsed), max: String(e.maxAttempts) }}
                />
                {' · '}
                <FormattedMessage {...messages.round} values={{ round: String(e.round) }} />
              </Field>
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
              <Field label={<FormattedMessage {...messages.lastActivity} />}>{formatDateTime(e.lastActivityAt)}</Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {closed ? (
                <Field label={<FormattedMessage {...messages.closedOn} values={{ date: formatDate(e.closedAt) }} />}>
                  {e.closureReason ? <FormattedMessage {...common[e.closureReason]} /> : '--'}
                </Field>
              ) : (
                <Field label={<FormattedMessage {...messages.autoCloseAt} />}>{formatDateTime(e.autoCloseAt)}</Field>
              )}
            </Grid>
          </Grid>

          {e.decision && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <FormattedMessage
                {...messages.decisionDueV3}
                values={{
                  n: String(e.decision.attemptNo),
                  failed: e.decision.failedTrainingIds.map(code).join(', ') || '--',
                  retrainable: e.decision.retrainableTrainingIds.map(code).join(', ') || '--',
                  now: formatAmount(e.decision.payoutNow),
                }}
              />
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Trainings */}
      <Section title={<FormattedMessage {...messages.trainingsTitle} />}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          <FormattedMessage {...messages.progressHelp} values={{ pct: String(e.rules.retrainBelowPct) }} />
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage {...messages.training} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.status} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.trained} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.attempts} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.bestPct} />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage {...messages.payout} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {e.trainings.map((item) => {
                const rule = rules.find((t) => t.trainingId === item.trainingId);
                const progress = itemProgress(item);
                return (
                  <TableRow key={item.trainingId}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.code} · {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        <FormattedMessage
                          {...messages.ruleLine}
                          values={{
                            pass: String(item.passMarks),
                            max: String(item.maxMarks),
                            floor: formatAmount(rule?.payoutFloor),
                            top: formatAmount(Math.max(0, ...(rule?.bands ?? []).map((b) => b.amount))),
                          }}
                        />
                      </Typography>
                      {item.kind === 'IMPROVEMENT' && (
                        <Typography variant="caption" color="info.main" sx={{ display: 'block' }}>
                          <FormattedMessage
                            {...messages.improvingFrom}
                            values={{
                              pct: formatPct(item.previousBestPct),
                              band: formatAmount(item.previousBand),
                            }}
                          />
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={PROGRESS_COLOR[progress]}
                        label={<FormattedMessage {...messages[`progress_${progress}`]} />}
                      />
                    </TableCell>
                    <TableCell>
                      {item.completed ? (
                        formatDateTime(item.completedAt)
                      ) : (
                        <Typography component="span" variant="body2" color="text.secondary">
                          <FormattedMessage {...messages.pending} />
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{item.attemptsUsed}</TableCell>
                    <TableCell align="right">{item.best ? formatPct(item.best.scorePct) : '--'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatAmount(item.payout)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Section>

      {/* Attempts */}
      <Section title={<FormattedMessage {...messages.attemptsTitle} />}>
        {attempts.length === 0 ? (
          <Typography color="text.secondary">
            <FormattedMessage {...messages.noAttempts} />
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {rules.map((t) => (
                    <TableCell key={t.trainingId} align="right">
                      {t.code}
                    </TableCell>
                  ))}
                  {canOverride && <TableCell />}
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.map((a) => {
                  const wrongSteps = a.marks.flatMap((m) =>
                    (m.steps ?? []).filter((s) => !s.correct).map((s) => `${code(m.trainingId)}: ${s.stepCode}`),
                  );
                  return (
                    <TableRow key={a.attemptId} sx={{ verticalAlign: 'top' }}>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            <FormattedMessage {...messages.attemptNo} values={{ n: String(a.attemptNo) }} />
                          </Typography>
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
                          <FormattedMessage {...messages.testedBy} values={{ name: a.testerName ?? '--' }} />
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
                                name: a.overriddenByName ?? intl.formatMessage(common.admin),
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
                      {rules.map((t) => {
                        const m = a.marks.find((x) => x.trainingId === t.trainingId);
                        return (
                          <TableCell
                            key={t.trainingId}
                            align="right"
                            sx={{ color: m && !m.passed ? 'error.main' : 'text.primary', fontWeight: 600 }}
                          >
                            {m ? m.marks : '·'}
                            {m && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {formatPct(m.scorePct)} · {formatAmount(m.payout)}
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
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

      <Grid container spacing={2.5}>
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
                            {!!d.trainingIds?.length && (
                              <Typography variant="caption" sx={{ display: 'block' }}>
                                <FormattedMessage
                                  {...messages.retrainChosen}
                                  values={{ trainings: d.trainingIds.map(code).join(', ') }}
                                />
                              </Typography>
                            )}
                            {d.reason && (
                              <Typography variant="caption" color="text.secondary">
                                {d.reason}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {d.actorName ?? intl.formatMessage(d.actorType === 'SYSTEM' ? common.system : common.admin)}
                          </TableCell>
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
                              values={{ from: a.fromTrainerName ?? unassigned, to: a.toTrainerName ?? unassigned }}
                            />
                          </Typography>
                          {a.reason && (
                            <Typography variant="caption" color="text.secondary">
                              {a.reason}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{a.byName ?? '--'}</TableCell>
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
            {e.ledgerEntries.length === 0 ? (
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
                      <FormattedMessage {...messages.training} />
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
                  {e.ledgerEntries.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(l.date ?? l.createdAt)}</TableCell>
                      <TableCell>
                        <LedgerKindLabel kind={l.kind} />
                      </TableCell>
                      <TableCell>{l.training?.code ?? ''}</TableCell>
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
