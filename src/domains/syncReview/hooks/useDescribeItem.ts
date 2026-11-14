import { useCallback } from 'react';

import { useIntl } from 'react-intl';

import { StaffSyncReviewItem } from '@/providers/service/app.schemas';

import messages from '../messages';

/** One line saying what a sync item did, from its type and payload */
export function useDescribeItem() {
  const intl = useIntl();
  return useCallback(
    (item: StaffSyncReviewItem) => {
      const p = item.payload as Record<string, unknown>;
      if (item.type === 'attendance.mark') {
        return intl.formatMessage(messages.typeAttendance, {
          section: item.section?.displayName ?? intl.formatMessage(messages.unknownSection),
          date: typeof p.date === 'string' ? p.date : '?',
          absent: Array.isArray(p.absentAdmissionIds) ? p.absentAdmissionIds.length : 0,
        });
      }
      if (item.type === 'interview.submit') {
        return intl.formatMessage(messages.typeInterview, { gr: typeof p.grNumber === 'string' ? p.grNumber : '?' });
      }
      return item.type;
    },
    [intl],
  );
}
