import { useIntl } from 'react-intl';

import { Box, Chip, Divider, Rating, Stack, Typography } from '@mui/material';

import { StudentProfileInterview } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { formatDate } from '../utils';

import { SectionCard } from './SectionCard';

export function InterviewSummary({ interview }: { interview?: StudentProfileInterview }) {
  const intl = useIntl();
  // An interview is done by an admin in the portal or by a teacher in the staff app (core #20)
  const interviewer = interview?.teacher
    ? interview.teacher.name
    : interview?.staffUser
      ? intl.formatMessage(messages.byStaffApp, {
          name: interview.staffUser.name,
          staffId: interview.staffUser.staffId,
        })
      : intl.formatMessage(messages.interviewerUnknown);

  return (
    <SectionCard
      title={<FormattedMessage {...messages.interview} />}
      summary={
        interview?.averageRating !== undefined && (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={<FormattedMessage {...messages.averageRating} values={{ value: String(interview.averageRating) }} />}
          />
        )
      }
    >
      {!interview ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.noInterview} />
        </Typography>
      ) : (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            {interview.questionSetTitle} ·{' '}
            <FormattedMessage
              {...messages.interviewBy}
              values={{ name: interviewer, date: formatDate(interview.createdAt) }}
            />
          </Typography>
          <Stack divider={<Divider flexItem />} spacing={0.75}>
            {interview.ratings.map((r) => (
              <Box key={r.questionId}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {r.prompt}
                  </Typography>
                  <Rating value={r.rating} max={5} size="small" readOnly />
                </Stack>
                {r.notes && (
                  <Typography variant="caption" color="text.secondary">
                    {r.notes}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
          {interview.notes && (
            <Box sx={{ pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage {...messages.notes} />
              </Typography>
              <Typography variant="body2">{interview.notes}</Typography>
            </Box>
          )}
        </Stack>
      )}
    </SectionCard>
  );
}
