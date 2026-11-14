import { Box, Stack, Typography } from '@mui/material';

import { SessionDashboardRecord } from '@/providers/service/app.schemas';

import FormattedMessage from '@/theme/FormattedMessage';

import { NUMERIC } from '../constants';
import { formatNumber, sessionLabel } from '../format';
import messages from '../messages';

import { Panel } from './Panel';

export interface RecordStripProps {
  record?: SessionDashboardRecord;
  /** The session being monitored, marked in the strip */
  sessionId?: string;
  isLoading?: boolean;
}

const tile = {
  flex: '1 0 190px',
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
} as const;

/** Every year on record in one row, oldest first, so the trend reads left to right. */
export function RecordStrip({ record, sessionId, isLoading }: RecordStripProps) {
  return (
    <Panel title={<FormattedMessage {...messages.recordTitle} />} isLoading={isLoading} loadingHeight={110}>
      <Stack spacing={1.5} data-testid="record-strip">
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {record && record.legacyRecords2025 > 0 && (
            <Box sx={tile} data-testid="record-2025">
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                2025
              </Typography>
              <Typography variant="h5" component="div" fontWeight={700} sx={NUMERIC}>
                {formatNumber(record.legacyRecords2025)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage {...messages.recordLegacy} />
              </Typography>
            </Box>
          )}
          {record?.sessions.map((row) => (
            <Box
              key={row.session.id}
              data-testid={`record-${row.session.id}`}
              sx={{ ...tile, ...(row.session.id === sessionId ? { borderColor: 'text.primary' } : {}) }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {sessionLabel(row.session)}
              </Typography>
              <Typography variant="h5" component="div" fontWeight={700} sx={NUMERIC}>
                {formatNumber(row.admitted)}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 14, ml: 1 }}>
                  <FormattedMessage {...messages.recordAdmitted} />
                </Box>
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                <FormattedMessage {...messages.recordApplications} values={{ count: formatNumber(row.applications) }} />
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                <FormattedMessage
                  {...messages.recordMix}
                  values={{
                    returning: formatNumber(row.returningStudents),
                    newStudents: formatNumber(row.newStudents),
                  }}
                />
              </Typography>
            </Box>
          ))}
        </Stack>
        {record && (
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage
              {...messages.recordUnique}
              values={{ count: formatNumber(record.uniqueStudentsAdmitted) }}
            />
          </Typography>
        )}
      </Stack>
    </Panel>
  );
}
