'use client';

import { useMemo } from 'react';

import { format } from 'date-fns';

import { Alert, Box, Chip, LinearProgress, Skeleton, Stack, Tooltip, Typography } from '@mui/material';

import { AttendanceStatus, StudentProfileAdmission } from '@/providers/service/app.schemas';
import { useAttendanceControllerStudentHistory } from '@/providers/service/attendance/attendance';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import messages from '../messages';

import { SectionCard } from './SectionCard';

const statusColor: Record<AttendanceStatus, string> = {
  PRESENT: 'success.main',
  LATE: 'info.main',
  ABSENT: 'error.main',
  EXCUSED: 'grey.500',
};

const statusLabel = {
  PRESENT: messages.present,
  LATE: messages.late,
  ABSENT: messages.absent,
  EXCUSED: messages.excused,
};

/** How many of the latest recorded days in a row were absences */
function absentStreak(statuses: AttendanceStatus[]): number {
  let n = 0;
  for (let i = statuses.length - 1; i >= 0 && statuses[i] === AttendanceStatus.ABSENT; i -= 1) n += 1;
  return n;
}

function DayBox({ date, status }: { date?: string; status?: AttendanceStatus }) {
  const label = useFormattedMessage(status ? statusLabel[status] : messages.notMarked);
  const day = date ? format(new Date(date), 'd') : '';
  const box = (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        ...(status
          ? { bgcolor: statusColor[status], color: 'common.white' }
          : { border: '1px dashed', borderColor: 'divider', color: 'text.disabled' }),
      }}
    >
      {day}
    </Box>
  );
  if (!date) return box;
  return (
    <Tooltip title={`${format(new Date(date), 'EEE d MMM')} · ${label}`} arrow>
      {box}
    </Tooltip>
  );
}

interface SessionAttendanceProps {
  studentId: string;
  /** This session's admission; missing when the student isn't admitted this session */
  admission?: StudentProfileAdmission;
  /** This session's name, for the "not admitted" note */
  sessionName?: string;
}

/**
 * This session's attendance, day by day (GET /attendance/student/:id?sessionId=), with the totals
 * and a warning when the latest days are absences.
 */
export function SessionAttendance({ studentId, admission, sessionName }: SessionAttendanceProps) {
  const { isAuthenticated } = useAuthenticatedApi();
  const sessionId = admission?.session.id ?? '';
  const { data, isLoading, isError } = useAttendanceControllerStudentHistory(
    studentId,
    { sessionId },
    { query: { enabled: isAuthenticated && !!sessionId } },
  );

  const days = useMemo(() => [...(data?.data ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [data?.data]);

  const title = (
    <FormattedMessage
      {...messages.attendanceThisSession}
      values={{ session: admission?.session.name ?? sessionName ?? '' }}
    />
  );

  if (!admission) {
    return (
      <SectionCard title={title} placeholder>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.notAdmittedThisSession} />
        </Typography>
      </SectionCard>
    );
  }

  const { attendance } = admission;
  const attended = attendance.present + attendance.late;
  const total = attendance.totalDays || 0;
  // Out of the days marked so far, so a session under way isn't measured against days still to come
  const marked = attendance.recordedDays;
  const percent = marked ? Math.round((attended / marked) * 100) : 0;
  const unmarked = Math.max(total - days.length, 0);
  const streak = absentStreak(days.map((d) => d.status));

  const counts = [
    { key: 'present', label: messages.present, value: attendance.present, color: 'success' as const },
    { key: 'late', label: messages.late, value: attendance.late, color: 'info' as const },
    { key: 'absent', label: messages.absent, value: attendance.absent, color: 'error' as const },
    { key: 'excused', label: messages.excused, value: attendance.excused, color: 'default' as const },
  ].filter((c) => c.value > 0);

  return (
    <SectionCard
      title={title}
      summary={
        attendance.recordedDays > 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage
              {...(marked < total ? messages.attendanceSoFar : messages.attendanceSummary)}
              values={{ attended: String(attended), marked: String(marked), total: String(total) }}
            />{' '}
            · {percent}%
          </Typography>
        ) : undefined
      }
    >
      <Stack spacing={1.5}>
        {streak >= 2 && (
          <Alert severity="warning" sx={{ py: 0 }}>
            <FormattedMessage {...messages.absentStreak} values={{ days: String(streak) }} />
          </Alert>
        )}
        {attendance.recordedDays > 0 && (
          <LinearProgress
            variant="determinate"
            value={percent}
            color={percent < 60 ? 'warning' : 'success'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        )}
        {isLoading && <Skeleton variant="rounded" height={26} />}
        {isError && (
          <Alert severity="error" sx={{ py: 0 }}>
            <FormattedMessage {...messages.attendanceLoadError} />
          </Alert>
        )}
        {!isLoading && !isError && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {days.map((d) => (
              <DayBox key={d.attendanceDayId} date={d.date} status={d.status} />
            ))}
            {Array.from({ length: unmarked }, (_, i) => (
              <DayBox key={`unmarked-${i}`} />
            ))}
          </Box>
        )}
        {attendance.recordedDays === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.attendanceNone} />
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {counts.map((c) => (
              <Chip
                key={c.key}
                size="small"
                variant="outlined"
                color={c.color}
                label={
                  <>
                    <FormattedMessage {...c.label} />: {c.value}
                  </>
                }
              />
            ))}
            {unmarked > 0 && (
              <Chip
                size="small"
                variant="outlined"
                label={
                  <>
                    <FormattedMessage {...messages.notMarked} />: {unmarked}
                  </>
                }
              />
            )}
          </Stack>
        )}
      </Stack>
    </SectionCard>
  );
}
