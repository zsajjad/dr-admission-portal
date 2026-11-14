'use client';

import { ReactNode, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { CheckCircle as DoneIcon, RadioButtonUnchecked as PendingIcon, Flag as FlagIcon } from '@mui/icons-material';
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

import { Attempt, EnrollmentDetail, useEnrollment } from '../../api/operations';
import { LedgerKindLabel, LedgerStatusChip } from '../../components/LedgerChips';
import { Section } from '../../components/Section';
import { StateChip } from '../../components/StateChip';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { actorName, cardStyle, formatAmount, formatDate, formatDateTime, formatPct } from '../../utils';
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

export function EnrollmentDetailBody({ enrollment: e }: { enrollment: EnrollmentDetail }) {
  const intl = useIntl();
  const { canManage, canOverride } = useTrainingsAccess();
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [overriding, setOverriding] = useState<Attempt | null>(null);
  const closed = e.state === 'CLOSED';
  const trainings = useMemo(() => [...e.rules.trainings].sort((a, b) => a.sortOrder - b.sortOrder), [e.rules]);
  const actorLabels = { system: intl.formatMessage(common.system), admin: intl.formatMessage(common.admin) };
  const rounds = Array.from({ length: Math.max(e.round, 1) }, (_, i) => i + 1);
  const attempts = [...e.attempts].sort((a, b) => a.attemptNo - b.attemptNo);
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
                  {e.student.name}
                </Typography>
                <Chip size="small" variant="outlined" label={e.student.grNumber} sx={{ fontFamily: 'monospace' }} />
                <StateChip state={e.state} closureReason={e.closureReason} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {[
                  e.student.fatherName,
                  intl.formatMessage(e.student.gender === 'FEMALE' ? common.girls : common.boys),
                  e.student.branch?.name,
                  e.student.area?.name,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button size="small" component={Link} href={routes.students.profile(e.student.id)}>
                  <FormattedMessage {...messages.openProfile} />
                </Button>
                <Button size="small" component={Link} href={routes.trainings.student(e.student.id)}>
                  <FormattedMessage {...messages.allTrainings} />
                </Button>
              </Stack>
            </Box>
            {canManage && (
              <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                <Tooltip title={closed ? reopenFirst : ''}>
                  <span>
                    <Button variant="outlined" size="small" disabled={closed} onClick={() => setDialog('trainer')}>
                      <FormattedMessage {...(e.trainer ? messages.reassignTrainer : messages.assignTrainer)} />
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
                {e.session.name}
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
                {e.trainer?.name ?? (
                  <Typography component="span" variant="body2" color="warning.dark">
                    <FormattedMessage {...common.unassigned} />
                  </Typography>
                )}
              </Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.nextTester} />}>
                {e.tester?.name ?? <FormattedMessage {...messages.anyTester} />}
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
              <Field label={<FormattedMessage {...messages.bestPct} />}>{formatPct(e.bestPct)}</Field>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Field label={<FormattedMessage {...messages.payout} />}>
                {closed ? formatAmount(e.payoutAmount) : formatAmount(e.projectedPayout)}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <FormattedMessage {...(closed ? messages.fixedPayout : messages.pendingPayout)} />
                </Typography>
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
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {/* Progress */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Section title={<FormattedMessage {...messages.progress} />}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage {...messages.training} />
                  </TableCell>
                  {rounds.map((round) => (
                    <TableCell key={round} align="center">
                      <FormattedMessage {...messages.round} values={{ round: String(round) }} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.code} · {t.name}
                    </TableCell>
                    {rounds.map((round) => {
                      const p = e.progress.find((x) => x.round === round && x.trainingId === t.id);
                      return (
                        <TableCell key={round} align="center">
                          <Tooltip title={p?.completed ? formatDateTime(p.completedAt) : ''}>
                            {p?.completed ? (
                              <DoneIcon fontSize="small" color="success" />
                            ) : (
                              <PendingIcon fontSize="small" color="disabled" />
                            )}
                          </Tooltip>
                        </TableCell>
                      );
                    })}
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
                        <TableCell key={t.id} align="right">
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
                    {attempts.map((a) => (
                      <TableRow key={a.id} sx={{ verticalAlign: 'top' }}>
                        <TableCell sx={{ minWidth: 240 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              <FormattedMessage {...messages.attemptNo} values={{ n: String(a.attemptNo) }} />
                            </Typography>
                            {a.id === e.bestAttemptId && (
                              <Chip size="small" color="success" label={<FormattedMessage {...messages.best} />} />
                            )}
                            {a.flag && (
                              <Tooltip
                                title={
                                  a.flag === 'LATE_GRADE' || a.flag === 'SENT_AFTER_LOGOUT'
                                    ? intl.formatMessage(messages[`flag_${a.flag}`])
                                    : intl.formatMessage(messages.flagOther, { code: a.flag })
                                }
                              >
                                <FlagIcon fontSize="small" color="warning" />
                              </Tooltip>
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            <FormattedMessage {...messages.testedBy} values={{ name: a.tester?.name ?? '--' }} />
                            {a.window && (
                              <>
                                {' '}
                                <FormattedMessage {...messages.inWindow} values={{ window: a.window.name }} />
                              </>
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            <FormattedMessage
                              {...messages.gradedAt}
                              values={{ at: formatDateTime(a.clientTime), received: formatDateTime(a.receivedAt) }}
                            />
                          </Typography>
                          {a.override && (
                            <Typography variant="caption" color="warning.dark" sx={{ display: 'block' }}>
                              <FormattedMessage
                                {...messages.overridden}
                                values={{
                                  name: actorName(a.override.by, actorLabels),
                                  at: formatDateTime(a.override.at),
                                  reason: a.override.reason,
                                }}
                              />
                            </Typography>
                          )}
                        </TableCell>
                        {trainings.map((t) => {
                          const m = a.marks.find((x) => x.trainingId === t.id);
                          return (
                            <TableCell
                              key={t.id}
                              align="right"
                              sx={{ color: m && !m.passed ? 'error.main' : 'text.primary', fontWeight: 600 }}
                            >
                              {m?.marks ?? '--'}
                              {m?.originalMarks !== undefined && m?.originalMarks !== null && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  <FormattedMessage
                                    {...messages.wasMarks}
                                    values={{ marks: String(m.originalMarks) }}
                                  />
                                </Typography>
                              )}
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
                    ))}
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
                    .map((d) => (
                      <TableRow key={d.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDateTime(d.clientTime ?? d.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            <FormattedMessage {...common[d.kind]} />
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
                        <TableCell>{actorName(d.by, actorLabels)}</TableCell>
                      </TableRow>
                    ))}
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
                    .map((a) => (
                      <TableRow key={a.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(a.createdAt)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            <FormattedMessage
                              {...messages.fromTo}
                              values={{
                                from: a.from?.name ?? intl.formatMessage(common.unassigned),
                                to: a.to?.name ?? intl.formatMessage(common.unassigned),
                              }}
                            />
                          </Typography>
                          {a.reason && (
                            <Typography variant="caption" color="text.secondary">
                              {a.reason}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{actorName(a.by, actorLabels)}</TableCell>
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
                  {e.ledgerEntries.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(l.createdAt)}</TableCell>
                      <TableCell>
                        <LedgerKindLabel kind={l.kind} />
                      </TableCell>
                      <TableCell>{l.trainer.name}</TableCell>
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
