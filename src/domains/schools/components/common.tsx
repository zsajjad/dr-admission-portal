'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { Autocomplete, Chip, CircularProgress, TextField, Typography } from '@mui/material';

import { Area, School, SchoolKind } from '@/providers/service/app.schemas';
import { useAreaControllerFindAll } from '@/providers/service/area/area';
import { useSchoolControllerFindAll } from '@/providers/service/school/school';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';
import { isSchoolQueryKey } from '../rules';

type Msg = { id: string; defaultMessage: string };

/** Light card used for the filter bar and the detail cards, as on the admissions list */
export const cardStyle = {
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  p: 2.5,
};

export const KIND_LABELS: Record<SchoolKind, Msg> = {
  SCHOOL: messages.kindSCHOOL,
  COLLEGE: messages.kindCOLLEGE,
  UNIVERSITY: messages.kindUNIVERSITY,
  MADRASA: messages.kindMADRASA,
};

export const KINDS = Object.keys(KIND_LABELS) as SchoolKind[];

/** Fetches every school query again: the list, each school and the unmatched names */
export function useRefreshSchools() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ predicate: (q) => isSchoolQueryKey(q.queryKey) }),
    [queryClient],
  );
}

/** Snackbar messages: the API's own message on error, since it explains refusals (e.g. a taken spelling) */
export function useNotify() {
  const { show } = useSnackbarContext();
  const saved = useFormattedMessage(messages.saved);
  const saveFailed = useFormattedMessage(messages.saveFailed);
  const success = useCallback(
    (message?: string) => show({ message: message || saved, type: 'success' }),
    [show, saved],
  );
  const error = useCallback(
    (err: unknown) => show({ message: extractNetworkError(err) || saveFailed, type: 'error' }),
    [show, saveFailed],
  );
  return { success, error };
}

/** Every area (they're few), for names and pickers */
export function useAreas() {
  const { data, isLoading } = useAreaControllerFindAll({ take: 100 });
  const areas = useMemo(() => data?.data ?? [], [data]);
  const byId = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);
  return { areas, byId, isLoading };
}

export const areaLabel = (area: Area) => `${area.code} · ${area.name}`;

/** Pick any number of areas */
export function AreasSelect({
  value,
  onChange,
  label,
  helperText,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
}) {
  const { areas, isLoading } = useAreas();
  const selected = useMemo(() => areas.filter((a) => value.includes(a.id)), [areas, value]);
  return (
    <Autocomplete<Area, true>
      multiple
      options={areas}
      value={selected}
      loading={isLoading}
      getOptionLabel={areaLabel}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, next) => onChange(next.map((a) => a.id))}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className || ''} font-urdu`}>
          {areaLabel(option)}
        </li>
      )}
      renderValue={(items, getItemProps) =>
        items.map((option, index) => {
          const { key, className, ...itemProps } = getItemProps({ index });
          return (
            <Chip
              key={key}
              label={areaLabel(option)}
              size="small"
              className={`${className} font-urdu`}
              {...itemProps}
            />
          );
        })
      }
      renderInput={(params) => <TextField {...params} label={label} helperText={helperText} />}
    />
  );
}

/** Free-typed spellings, one chip each */
export function SpellingsInput({
  value,
  onChange,
  label,
  helperText,
}: {
  value: string[];
  onChange: (names: string[]) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
}) {
  return (
    <Autocomplete<string, true, false, true>
      multiple
      freeSolo
      options={[]}
      value={value}
      onChange={(_, next) => onChange(next.map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean))}
      renderValue={(items, getItemProps) =>
        items.map((option, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          return <Chip key={key} label={option} size="small" {...itemProps} />;
        })
      }
      renderInput={(params) => <TextField {...params} label={label} helperText={helperText} />}
    />
  );
}

/** Search the schools by name or spelling and pick one; inactive ones are included */
export function SchoolPicker({
  value,
  onChange,
  excludeIds = [],
  label,
  autoFocus,
}: {
  value: School | null;
  onChange: (school: School | null) => void;
  excludeIds?: string[];
  label?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const intl = useIntl();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isFetching } = useSchoolControllerFindAll({
    search: search || undefined,
    take: 30,
    includeInActive: true,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const options = useMemo(
    () => (data?.data ?? []).filter((s) => !excludeIds.includes(s.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, excludeIds.join(',')],
  );

  return (
    <Autocomplete<School, false>
      options={value && !options.some((o) => o.id === value.id) ? [value, ...options] : options}
      value={value}
      onChange={(_, next) => onChange(next)}
      inputValue={input}
      onInputChange={(_, next) => setInput(next)}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      loading={isFetching}
      noOptionsText={intl.formatMessage(messages.noMatches)}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.name}
              {option.isActive === false ? ` (${intl.formatMessage(messages.inactive)})` : ''}
            </Typography>
            {option.aliases.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {option.aliases.slice(0, 4).join(' · ')}
                {option.aliases.length > 4 ? ' …' : ''}
              </Typography>
            )}
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          label={label ?? intl.formatMessage(messages.school)}
          helperText={intl.formatMessage(messages.schoolSearchHint)}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isFetching ? <CircularProgress color="inherit" size={18} /> : null}
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
