'use client';

import { Alert, Button, Chip, Skeleton, Stack, Typography } from '@mui/material';

import { formatBirthDate } from '@/domains/students/utils';

import { useStudentMergeControllerLikelyDuplicates } from '@/providers/service/student-merge/student-merge';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

interface DuplicatesProps {
  studentId: string;
  onCompare: (studentId: string) => void;
}

/** Active records of the same gender that may be the same child, strongest matches first. */
export function Duplicates({ studentId, onCompare }: DuplicatesProps) {
  const { data, isLoading } = useStudentMergeControllerLikelyDuplicates(studentId);
  if (isLoading) return <Skeleton variant="rounded" height={80} />;
  const list = data?.data || [];
  if (!list.length) {
    return (
      <Alert severity="info" sx={{ py: 0 }}>
        <FormattedMessage {...messages.likelyNone} />
      </Alert>
    );
  }
  return (
    <Stack spacing={1}>
      {list.map((d) => (
        <Stack
          key={d.id}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 2 }}
        >
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {d.name}{' '}
              <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace' }}>
                {d.grNumber}
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {d.fatherName} · {formatBirthDate(d.dateOfBirth)} ·{' '}
              {d.sessions.length ? (
                <FormattedMessage {...messages.sessions} values={{ list: d.sessions.join(', ') }} />
              ) : (
                <FormattedMessage {...messages.noSessions} />
              )}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {d.matchedOn.map((m) => (
              <Chip
                key={m}
                size="small"
                color="warning"
                variant="outlined"
                label={<FormattedMessage {...messages[`match${m}`]} />}
              />
            ))}
          </Stack>
          <Button size="small" variant="outlined" onClick={() => onCompare(d.id)}>
            <FormattedMessage {...messages.compareWith} />
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
