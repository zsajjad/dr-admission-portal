'use client';

import * as React from 'react';

import { useIntl } from 'react-intl';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

export interface LookupView {
  tool: string;
  input?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  rows?: number;
  suppressedRows?: number;
  error?: string;
  done?: boolean;
}

const TOOL_LABELS: Record<string, keyof typeof messages> = {
  get_reference_data: 'toolGetReferenceData',
  admissions_report: 'toolAdmissionsReport',
  fee_day_progress: 'toolFeeDayProgress',
  attendance_report: 'toolAttendanceReport',
  attendance_distribution: 'toolAttendanceDistribution',
  results_report: 'toolResultsReport',
  final_results_report: 'toolFinalResultsReport',
  skill_steps_report: 'toolSkillStepsReport',
  interviews_report: 'toolInterviewsReport',
  run_report_query: 'toolRunReportQuery',
};

export function ToolLabel({ tool }: { tool: string }): React.JSX.Element {
  return <>{useToolLabel(tool)}</>;
}

/** The tool's name for people, in the portal's language. */
export function useToolLabel(tool: string | undefined): string {
  const intl = useIntl();
  if (!tool) return '';
  const key = TOOL_LABELS[tool];
  return key ? intl.formatMessage(messages[key]) : tool;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** The filters a lookup used, as chips. The free-form query shows its SQL instead. */
function FilterChips({ lookup }: { lookup: LookupView }): React.JSX.Element {
  const filters = { ...(lookup.filters ?? {}) };
  const sql = (filters.sqlRun as string | undefined) ?? (lookup.input?.sql as string | undefined);
  delete filters.sqlRun;
  delete filters.view;
  const groupBy = lookup.input?.groupBy as string[] | undefined;
  const entries = Object.entries(filters);
  return (
    <Stack spacing={0.75}>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {entries.map(([k, v]) => (
          <Chip key={k} size="small" variant="outlined" label={`${k}: ${formatValue(v)}`} />
        ))}
        {groupBy?.length ? <Chip size="small" variant="outlined" label={`groupBy: ${groupBy.join(', ')}`} /> : null}
        {!entries.length && !groupBy?.length && !sql ? (
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage {...messages.noFilters} />
          </Typography>
        ) : null}
      </Stack>
      {sql ? (
        <Box
          component="pre"
          dir="ltr"
          sx={{ m: 0, p: 1, borderRadius: 1, bgcolor: 'action.hover', fontSize: 12, whiteSpace: 'pre-wrap' }}
        >
          {sql}
        </Box>
      ) : null}
    </Stack>
  );
}

/** "What was looked up": the tools and filters behind an answer. Never any rows. */
export function LookupList({ lookups, defaultExpanded = false }: { lookups: LookupView[]; defaultExpanded?: boolean }) {
  if (!lookups.length) return null;
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      variant="outlined"
      sx={{ mt: 1.5, borderRadius: 1, '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ManageSearchIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.whatWasLookedUp} values={{ count: String(lookups.length) }} />
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {lookups.map((lookup, i) => (
            <Box key={i}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
                <Typography variant="subtitle2">
                  <ToolLabel tool={lookup.tool} />
                </Typography>
                {lookup.done !== false && !lookup.error ? (
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage {...messages.rows} values={{ count: String(lookup.rows ?? 0) }} />
                  </Typography>
                ) : null}
                {lookup.suppressedRows ? (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label={
                      <FormattedMessage {...messages.hiddenGroups} values={{ count: String(lookup.suppressedRows) }} />
                    }
                  />
                ) : null}
                {lookup.error ? (
                  <Typography variant="caption" color="error">
                    <FormattedMessage {...messages.lookupFailed} values={{ error: lookup.error }} />
                  </Typography>
                ) : null}
              </Stack>
              <FilterChips lookup={lookup} />
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
