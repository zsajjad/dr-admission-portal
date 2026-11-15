'use client';

import { useIntl } from 'react-intl';

import { Box, Stack, Typography } from '@mui/material';

import { formatDate } from '@/domains/students/utils';

import { FamilyEntity } from '@/providers/service/app.schemas';

import messages from '../messages';

import { relationMessage, useReasonsText } from './chips';

interface Event {
  key: string;
  at: string;
  text: string;
  detail: string;
  error?: boolean;
  open: boolean;
}

/**
 * The household's membership history, newest first (UX spec, "History"): who joined, as what, who confirmed it
 * and on what; who moved out; links made in error, struck through.
 */
export function HouseholdHistory({ family, names }: { family: FamilyEntity; names: Map<string, string> }) {
  const intl = useIntl();
  const reasonsText = useReasonsText();
  const members = new Map(family.members.map((m) => [m.membershipId, m]));

  const events: Event[] = [];
  for (const h of family.history ?? []) {
    const name = names.get(h.studentId) ?? h.grNumber;
    const member = members.get(h.membershipId);
    const evidence = (member?.evidence ?? {}) as { reasons?: string[]; level?: string; fatherScore?: number };
    const who = member?.confirmedBy?.name ?? member?.confirmedByStaffUser?.name;
    events.push({
      key: `${h.membershipId}-join`,
      at: h.confirmedAt,
      text: intl.formatMessage(messages.historyJoined, {
        name,
        relation: intl.formatMessage(relationMessage(h.relation)),
      }),
      detail: [
        formatDate(h.confirmedAt),
        who
          ? intl.formatMessage(messages.historyBy, { name: who })
          : intl.formatMessage(
              (messages as Record<string, { id: string; defaultMessage: string }>)[`historyMethod${h.method}`] ??
                messages.historyMethodADMIN,
            ),
        evidence.reasons?.length ? reasonsText(evidence.reasons, evidence.fatherScore) : '',
        h.validFrom ? intl.formatMessage(messages.inFamilySince, { date: formatDate(h.validFrom) }) : '',
      ]
        .filter(Boolean)
        .join(' · '),
      error: h.endReason === 'LINKED_IN_ERROR',
      open: !h.validTo,
    });
    if (h.endReason === 'MOVED_OUT' && h.validTo) {
      events.push({
        key: `${h.membershipId}-left`,
        at: h.validTo,
        text: intl.formatMessage(messages.historyMovedOut, { name }),
        detail: [formatDate(h.validTo), intl.formatMessage(relationMessage(h.relation))].join(' · '),
        open: false,
      });
    }
    if (h.endReason === 'LINKED_IN_ERROR') {
      events.push({
        key: `${h.membershipId}-error`,
        at: h.validTo ?? h.confirmedAt,
        text: intl.formatMessage(messages.historyError, { name }),
        detail: h.validTo ? formatDate(h.validTo) : '',
        open: false,
      });
    }
  }
  events.sort((a, b) => b.at.localeCompare(a.at));

  if (!events.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.noHistory)}
      </Typography>
    );
  }
  return (
    <Stack spacing={1.25}>
      {events.map((e) => (
        <Stack key={e.key} direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              mt: 0.75,
              width: 10,
              height: 10,
              borderRadius: '50%',
              flexShrink: 0,
              border: 2,
              borderColor: e.error ? 'error.main' : 'primary.main',
              bgcolor: e.open ? 'primary.main' : 'transparent',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: e.error ? 'line-through' : 'none' }}>
              {e.text}
            </Typography>
            {e.detail && (
              <Typography variant="caption" color="text.secondary">
                {e.detail}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
