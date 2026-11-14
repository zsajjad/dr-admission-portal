import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';

import { StudentProfileAttendance } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

import { SectionCard } from './SectionCard';

export function AttendanceSummary({ attendance }: { attendance: StudentProfileAttendance }) {
  const attended = attendance.present + attendance.late;
  const total = attendance.totalDays || 0;
  const percent = total ? Math.round((attended / total) * 100) : 0;
  const notMarked = Math.max(total - attendance.recordedDays, 0);

  const counts = [
    { key: 'present', label: messages.present, value: attendance.present, color: 'success' as const },
    { key: 'late', label: messages.late, value: attendance.late, color: 'info' as const },
    { key: 'absent', label: messages.absent, value: attendance.absent, color: 'error' as const },
    { key: 'excused', label: messages.excused, value: attendance.excused, color: 'default' as const },
    { key: 'notMarked', label: messages.notMarked, value: notMarked, color: 'default' as const },
  ];

  return (
    <SectionCard title={<FormattedMessage {...messages.attendance} />}>
      {attendance.recordedDays === 0 ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.attendanceNone} />
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                <FormattedMessage
                  {...messages.attendanceSummary}
                  values={{ attended: String(attended), total: String(total) }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {percent}%
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {counts
              .filter((c) => c.value > 0)
              .map((c) => (
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
          </Stack>
        </Stack>
      )}
    </SectionCard>
  );
}
