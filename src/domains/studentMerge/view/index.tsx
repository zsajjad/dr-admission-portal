'use client';

import { Alert, Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';

import { SectionCard } from '@/domains/students/components/SectionCard';
import { cardStyle, formatBirthDate } from '@/domains/students/utils';

import { PageHeading } from '@/components/PageHeading';

import { useStudentsControllerGetProfile } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { Compare } from '../components/Compare';
import { Duplicates } from '../components/Duplicates';
import { OldGrs } from '../components/OldGrs';
import { PickStudent } from '../components/PickStudent';
import messages from '../messages';

import { MergeHistory } from './History';

/** One picked record, with a way to pick another. */
function Picked({ studentId, onChange }: { studentId: string; onChange: () => void }) {
  const { data } = useStudentsControllerGetProfile(studentId);
  const s = data?.data.student;
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {s ? s.name : '…'}{' '}
          <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace' }}>
            {s?.grNumber}
          </Typography>
        </Typography>
        {s && (
          <Typography variant="caption" color="text.secondary" display="block">
            {s.fatherName} · {formatBirthDate(s.dateOfBirth)}
          </Typography>
        )}
        {s && <OldGrs grNumber={s.grNumber} />}
      </Box>
      <Button size="small" onClick={onChange}>
        <FormattedMessage {...messages.change} />
      </Button>
    </Stack>
  );
}

/**
 * Merge duplicate student records (core #14), following proposals/gr-cleanup.md: find likely
 * duplicates, compare side by side, merge with a reason, and undo from the history.
 */
export function StudentMergeView() {
  const { filters, setFilter } = useListingFilters<{ a?: string; b?: string; tab?: string }>();
  const tab = filters.tab === 'history' ? 'history' : 'merge';
  const first = useFormattedMessage(messages.firstRecord);
  const second = useFormattedMessage(messages.secondRecord);

  return (
    <Stack>
      <PageHeading heading={messages.title} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.intro} />
      </Typography>
      <Box sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setFilter({ tab: v === 'history' ? 'history' : undefined })}>
          <Tab value="merge" label={<FormattedMessage {...messages.tabMerge} />} />
          <Tab value="history" label={<FormattedMessage {...messages.tabHistory} />} />
        </Tabs>
      </Box>

      {tab === 'history' ? (
        <MergeHistory />
      ) : (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <SectionCard title={first}>
                {filters.a ? (
                  <Picked studentId={filters.a} onChange={() => setFilter({ a: undefined, b: undefined })} />
                ) : (
                  <PickStudent label={first} onPick={(s) => setFilter({ a: s.id })} />
                )}
              </SectionCard>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionCard title={second}>
                {filters.b ? (
                  <Picked studentId={filters.b} onChange={() => setFilter({ b: undefined })} />
                ) : (
                  <PickStudent label={second} onPick={(s) => setFilter({ b: s.id })} />
                )}
              </SectionCard>
            </Box>
          </Stack>

          {filters.a && !filters.b && (
            <SectionCard title={<FormattedMessage {...messages.likely} />}>
              <Duplicates studentId={filters.a} onCompare={(id) => setFilter({ b: id })} />
            </SectionCard>
          )}

          {filters.a && filters.b && filters.a === filters.b && (
            <Alert severity="warning">
              <FormattedMessage {...messages.sameRecord} />
            </Alert>
          )}
          {filters.a && filters.b && filters.a !== filters.b && <Compare firstId={filters.a} secondId={filters.b} />}
        </Stack>
      )}
    </Stack>
  );
}
