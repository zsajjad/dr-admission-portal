'use client';

import { useEffect, useState } from 'react';

import { MenuItem, TextField } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { useCatalog } from '../api/setup';
import messages from '../messages';

import { StaffUserSelect } from './StaffUserSelect';

type FilterValue = string | number | boolean | undefined;

/** A select bound to a URL query param */
export function UrlSelect({
  param,
  label,
  options,
  minWidth = 160,
}: {
  param: string;
  label: React.ReactNode;
  options: { value: string; label: React.ReactNode }[];
  minWidth?: number;
}) {
  const { filters, setFilter } = useListingFilters<Record<string, FilterValue>>();
  return (
    <TextField
      select
      size="small"
      sx={{ minWidth }}
      label={label}
      value={(filters[param] as string) ?? ''}
      onChange={(e) => setFilter({ [param]: e.target.value || undefined, page: 0 })}
    >
      <MenuItem value="">
        <FormattedMessage {...messages.all} />
      </MenuItem>
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

/** A catalog training select bound to `trainingId` */
export function TrainingFilter({ param = 'trainingId' }: { param?: string }) {
  const { data } = useCatalog();
  const options = (data?.data ?? []).map((t) => ({ value: t.id, label: `${t.code} · ${t.name}` }));
  return (
    <UrlSelect param={param} label={<FormattedMessage {...messages.training} />} options={options} minWidth={200} />
  );
}

/** A trainer or tester select bound to a URL query param (the staff user's ID) */
export function StaffFilter({ param, role, label }: { param: string; role: StaffRole; label: React.ReactNode }) {
  const { filters, setFilter } = useListingFilters<Record<string, FilterValue>>();
  return (
    <StaffUserSelect
      role={role}
      label={label}
      value={(filters[param] as string) ?? null}
      onChange={(id) => setFilter({ [param]: id ?? undefined, page: 0 })}
      minWidth={220}
    />
  );
}

/** A text box bound to a URL query param, applied after typing stops */
export function UrlTextFilter({
  param,
  label,
  type = 'text',
  helperText,
  minWidth = 200,
}: {
  param: string;
  label: React.ReactNode;
  type?: 'text' | 'number';
  helperText?: React.ReactNode;
  minWidth?: number;
}) {
  const { filters, setFilter } = useListingFilters<Record<string, FilterValue>>();
  const current = (filters[param] as string) ?? '';
  const [value, setValue] = useState(current);
  useEffect(() => setValue(current), [current]);
  useEffect(() => {
    if (value === current) return undefined;
    const timer = setTimeout(() => setFilter({ [param]: value.trim() || undefined, page: 0 }), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <TextField
      size="small"
      type={type}
      sx={{ minWidth }}
      label={label}
      value={value}
      helperText={helperText}
      onChange={(e) => setValue(e.target.value)}
      slotProps={type === 'number' ? { htmlInput: { min: 0 } } : undefined}
    />
  );
}
