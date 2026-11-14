'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useStudentsControllerGetProfile } from '@/providers/service/students/students';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { EnrollmentDetail, useStudentTrainings } from '../../api/operations';
import { useResolveCourse } from '../../api/setup';
import { StateChip } from '../../components/StateChip';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatAmount, formatDate, formatPct } from '../../utils';

import { EnrollDialog } from './EnrollDialog';
import messages from './messages';

function EnrollmentCard({ enrollment: e }: { enrollment: EnrollmentDetail }) {
  const trainings = [...e.rules.trainings].sort((a, b) => a.sortOrder - b.sortOrder);
  const done = new Set(e.progress.filter((p) => p.round === e.round && p.completed).map((p) => p.trainingId));
  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {e.session.name} · {e.course.code} · {e.course.name}
              </Typography>
              <StateChip state={e.state} closureReason={e.closureReason} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {[
                e.trainer?.name,
                `${e.attemptsUsed}/${e.maxAttempts}`,
                e.bestPct !== null ? formatPct(e.bestPct) : null,
                e.state === 'CLOSED' ? formatAmount(e.payoutAmount) : null,
                e.closedAt ? formatDate(e.closedAt) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
          <Button size="small" component={Link} href={routes.trainings.enrollment(e.id)}>
            <FormattedMessage {...messages.openEnrollment} />
          </Button>
        </Stack>

        <Box sx={{ overflowX: 'auto', mt: 1 }}>
          <Table size="small">
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
              </TableRow>
            </TableHead>
            <TableBody>
              {e.state !== 'CLOSED' && (
                <TableRow>
                  <TableCell>
                    <FormattedMessage {...messages.round} values={{ round: String(e.round) }} />
                  </TableCell>
                  {trainings.map((t) => (
                    <TableCell key={t.id} align="right">
                      {done.has(t.id) ? (
                        <Chip size="small" color="success" label={<FormattedMessage {...messages.done} />} />
                      ) : (
                        <Chip size="small" variant="outlined" label={<FormattedMessage {...messages.pending} />} />
                      )}
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              )}
              {[...e.attempts]
                .sort((a, b) => a.attemptNo - b.attemptNo)
                .map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <FormattedMessage {...messages.attemptNo} values={{ n: String(a.attemptNo) }} />
                      {a.id === e.bestAttemptId && (
                        <Chip
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                          label={<FormattedMessage {...messages.best} />}
                        />
                      )}
                    </TableCell>
                    {trainings.map((t) => {
                      const m = a.marks.find((x) => x.trainingId === t.id);
                      return (
                        <TableCell key={t.id} align="right" sx={{ color: m && !m.passed ? 'error.main' : undefined }}>
                          {m?.marks ?? '--'}
                        </TableCell>
                      );
                    })}
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatPct(a.weightedPct)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}

/** A student's Fiqh trainings in every year; trainings belong to the student, not to an admission */
export function StudentTrainingsView({ studentId }: { studentId: string }) {
  const { canManage } = useTrainingsAccess();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const { data: profileData } = useStudentsControllerGetProfile(studentId);
  const { data, isLoading, error } = useStudentTrainings(studentId);
  const { data: resolvedData } = useResolveCourse(studentId);
  const student = profileData?.data?.student;
  const enrollments = [...(data?.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const resolved = resolvedData?.data;
  const hasOpen = enrollments.some((e) => e.state !== 'CLOSED');

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {student ? `${student.name} · ${student.grNumber}` : <FormattedMessage {...messages.studentTrainings} />}
          </Typography>
          {resolved?.course && (
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage
                {...messages.matrixNow}
                values={{ course: `${resolved.course.code} · ${resolved.course.name}` }}
              />
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" component={Link} href={routes.students.profile(studentId)}>
            <FormattedMessage {...messages.openProfile} />
          </Button>
          {canManage && !hasOpen && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setEnrollOpen(true)}>
              <FormattedMessage {...messages.enroll} />
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}
      {isLoading && <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />}
      {!isLoading && !error && enrollments.length === 0 && (
        <Typography color="text.secondary">
          <FormattedMessage {...messages.studentTrainingsEmpty} />
        </Typography>
      )}
      {enrollments.map((e) => (
        <EnrollmentCard key={e.id} enrollment={e} />
      ))}

      {canManage && <EnrollDialog open={enrollOpen} onClose={() => setEnrollOpen(false)} studentId={studentId} />}
    </Stack>
  );
}

/** A small card for the student profile: the latest training and a link to every year */
export function StudentTrainingsCard({ studentId }: { studentId: string }) {
  const { canRead } = useTrainingsAccess();
  const { data, isLoading } = useStudentTrainings(canRead ? studentId : undefined);
  if (!canRead) return null;
  const enrollments = [...(data?.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = enrollments[0];
  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              <FormattedMessage {...messages.profileCard} />
            </Typography>
            {isLoading && <Skeleton width={160} />}
            {!isLoading && !latest && (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.studentTrainingsEmpty} />
              </Typography>
            )}
            {latest && (
              <>
                <Typography variant="body2">
                  {latest.session.name} · {latest.course.code} · {latest.trainer?.name ?? '--'}
                  {latest.bestPct !== null ? ` · ${formatPct(latest.bestPct)}` : ''}
                </Typography>
                <StateChip state={latest.state} closureReason={latest.closureReason} />
                {enrollments.length > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage {...messages.profileCardSummary} values={{ count: String(enrollments.length) }} />
                  </Typography>
                )}
              </>
            )}
          </Stack>
          <Button size="small" component={Link} href={routes.trainings.student(studentId)}>
            <FormattedMessage {...messages.profileCardLink} />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
