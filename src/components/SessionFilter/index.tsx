'use client';

import { useMemo } from 'react';

import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { Session } from '@/providers/service/app.schemas';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import messages from './messages';

interface SessionFilterState {
  sessionId?: string;
}

export interface SessionFilterProps {
  size?: 'small' | 'medium';
  minWidth?: number;
  /** Additional callback when session changes */
  onSessionChange?: (sessionId: string | undefined) => void;
}

export function SessionFilter({ size = 'small', minWidth = 280, onSessionChange }: SessionFilterProps) {
  const { filters, setFilter } = useListingFilters<SessionFilterState>();

  // Fetch sessions for filter dropdown
  const { data: sessionsData, isLoading } = useSessionControllerFindAll({ take: 100 });
  const sessions = useMemo(() => sessionsData?.data || [], [sessionsData?.data]);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === filters.sessionId) || null,
    [sessions, filters.sessionId],
  );

  const handleChange = (_: unknown, newValue: Session | null) => {
    const newSessionId = newValue?.id;
    setFilter({ sessionId: newSessionId, page: 0 });
    onSessionChange?.(newSessionId);
  };

  return (
    <Autocomplete<Session, false>
      size={size}
      sx={{ minWidth }}
      options={sessions}
      getOptionLabel={(option) => option.name || ''}
      value={selectedSession}
      onChange={handleChange}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`} style={{ padding: '8px 16px' }}>
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage {...messages.sessionLabel} />}
          slotProps={{
            input: {
              ...params.InputProps,
              className: `${params.InputProps.className || ''} font-urdu`,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

export default SessionFilter;
