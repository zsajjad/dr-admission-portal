'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { useRouter } from 'next/navigation';

import { Search as SearchIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';
import { useStudentsControllerFindAll } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { ClosureReason, useEnroll } from '../../api/operations';
import { useCourses, useResolveCourse } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { ReasonField, reasonMissing } from '../../components/ReasonField';
import { StaffUserSelect } from '../../components/StaffUserSelect';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { formatPct } from '../../utils';

import messages from './messages';

interface EnrollDialogProps {
  open: boolean;
  onClose: () => void;
  /** Skip the GR lookup, e.g. from the student's trainings page */
  studentId?: string;
}

const MATRIX = '';

/**
 * Enroll a student by GR. The course comes from the age matrix unless the admin picks one;
 * enrolling again in a course the student has closed needs a reason.
 */
export function EnrollDialog({ open, onClose, studentId: givenStudentId }: EnrollDialogProps) {
  const router = useRouter();
  const intl = useIntl();
  const notify = useNotify();
  const enroll = useEnroll();
  const enrolledText = useFormattedMessage(messages.enrolled);
  const { data: coursesData } = useCourses();
  const courses = (coursesData?.data ?? []).filter((c) => c.isActive);

  const [gr, setGr] = useState('');
  const [searchGr, setSearchGr] = useState('');
  const [courseId, setCourseId] = useState(MATRIX);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGr('');
    setSearchGr('');
    setCourseId(MATRIX);
    setTrainerId(null);
    setReason('');
    setSubmitted(false);
  }, [open]);

  const { data: found, isFetching: finding } = useStudentsControllerFindAll(
    { search: searchGr, take: 5 },
    { query: { enabled: !!searchGr && !givenStudentId } },
  );
  const student = useMemo(
    () => found?.data.find((s) => s.grNumber === searchGr) ?? (found?.data.length === 1 ? found.data[0] : undefined),
    [found, searchGr],
  );
  const studentId = givenStudentId ?? student?.id;

  const { data: resolvedData, isFetching: resolving } = useResolveCourse(open ? studentId : undefined);
  const resolved = resolvedData?.data;
  const effectiveCourseId = courseId || resolved?.course?.id;
  const closedBefore = resolved?.completedCourses.find((c) => c.courseId === effectiveCourseId);
  const needsReason = !!closedBefore;
  const missingReason = needsReason && reasonMissing(reason);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!studentId || !effectiveCourseId || missingReason) return;
    enroll.mutate(
      {
        studentId,
        ...(courseId && { courseId }),
        ...(trainerId && { trainerStaffUserId: trainerId }),
        ...(needsReason && { reason: reason.trim() }),
      },
      {
        onSuccess: (res) => {
          notify.success(enrolledText);
          onClose();
          if (res?.data?.id) router.push(routes.trainings.enrollment(res.data.id));
        },
        onError: notify.error,
      },
    );
  };

  return (
    <ActionDialog
      open={open}
      title={<FormattedMessage {...messages.enrollTitle} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={enroll.isPending}
      submitLabel={<FormattedMessage {...messages.enroll} />}
      submitDisabled={!studentId || !effectiveCourseId}
    >
      <Stack spacing={2}>
        {!givenStudentId && (
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              fullWidth
              autoFocus
              label={<FormattedMessage {...messages.enrollGr} />}
              value={gr}
              onChange={(e) => setGr(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setSearchGr(gr.trim());
                }
              }}
              slotProps={{ htmlInput: { dir: 'ltr' } }}
            />
            <Button
              variant="outlined"
              startIcon={finding ? <CircularProgress size={16} /> : <SearchIcon />}
              onClick={() => setSearchGr(gr.trim())}
              disabled={!gr.trim()}
            >
              <FormattedMessage {...messages.findStudent} />
            </Button>
          </Stack>
        )}
        {searchGr && !finding && !student && !givenStudentId && (
          <Alert severity="warning">
            <FormattedMessage {...messages.studentNotFound} />
          </Alert>
        )}

        {student && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography sx={{ fontWeight: 600 }}>{student.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {[student.grNumber, student.fatherName, student.branch?.code].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        )}

        {studentId && resolving && <CircularProgress size={20} />}
        {resolved && (
          <>
            {resolved.course ? (
              <Alert severity="info">
                <FormattedMessage
                  {...messages.matrixCourse}
                  values={{ course: `${resolved.course.code} · ${resolved.course.name}` }}
                />
              </Alert>
            ) : (
              <Alert severity="warning">
                <FormattedMessage {...messages.matrixNone} values={{ age: String(resolved.age ?? '--') }} />
              </Alert>
            )}
            {resolved.completedCourses.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage {...messages.completedBefore} />
                </Typography>
                {resolved.completedCourses.map((c) => (
                  <Typography key={c.enrollmentId} variant="body2">
                    <FormattedMessage
                      {...messages.completedLine}
                      values={{
                        course: c.courseName,
                        session: c.sessionName,
                        result: intl.formatMessage(
                          common[(c.passed ? 'PASSED' : c.closureReason) as ClosureReason] ?? common.CLOSED,
                        ),
                        pct: formatPct(c.bestPct),
                      }}
                    />
                  </Typography>
                ))}
              </Box>
            )}
          </>
        )}

        <TextField
          select
          size="small"
          label={<FormattedMessage {...messages.courseOverride} />}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          error={submitted && !effectiveCourseId}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value={MATRIX}>
            <FormattedMessage {...messages.useMatrix} />
          </MenuItem>
          {courses.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.code} · {c.name}
            </MenuItem>
          ))}
        </TextField>

        <StaffUserSelect
          role={StaffRole.TRAINER}
          label={<FormattedMessage {...messages.trainerOptional} />}
          value={trainerId}
          onChange={setTrainerId}
        />

        {needsReason && (
          <>
            <Alert severity="warning">
              <FormattedMessage {...messages.enrollAgainReason} values={{ course: closedBefore?.courseName ?? '' }} />
            </Alert>
            <ReasonField value={reason} onChange={setReason} showError={submitted} />
          </>
        )}
      </Stack>
    </ActionDialog>
  );
}
