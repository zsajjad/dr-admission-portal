'use client';

import { useMemo } from 'react';

import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { StaffRole, StaffUserEntity } from '@/providers/service/app.schemas';
import { useStaffUserControllerFindAll } from '@/providers/service/staff-user/staff-user';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

/** Active staff users with a role, e.g. every trainer. Staff lists are small; the API pages at 100, which covers a season's trainers and testers. */
export function useStaffByRole(role: StaffRole) {
  const { isAuthenticated } = useAuthenticatedApi();
  const { data, isLoading } = useStaffUserControllerFindAll(
    { role, take: 100 },
    { query: { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 } },
  );
  return { staff: useMemo(() => data?.data ?? [], [data]), isLoading };
}

const label = (u: StaffUserEntity) => `${u.name} · ${u.staffId}`;

interface BaseProps {
  role: StaffRole;
  label: React.ReactNode;
  size?: 'small' | 'medium';
  minWidth?: number;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  /** Staff user IDs that can't be picked, e.g. the enrollment's trainer when picking a tester */
  excludeIds?: string[];
}

/** Pick one staff user with a role */
export function StaffUserSelect({
  role,
  value,
  onChange,
  label: fieldLabel,
  size = 'small',
  minWidth = 240,
  disabled,
  error,
  helperText,
  excludeIds = [],
}: BaseProps & { value: string | null; onChange: (id: string | null) => void }) {
  const { staff, isLoading } = useStaffByRole(role);
  const options = useMemo(() => staff.filter((u) => u.isActive && !excludeIds.includes(u.id)), [staff, excludeIds]);
  const selected = useMemo(() => staff.find((u) => u.id === value) ?? null, [staff, value]);
  return (
    <Autocomplete<StaffUserEntity, false>
      size={size}
      sx={{ minWidth }}
      options={options}
      value={selected}
      disabled={disabled}
      onChange={(_, v) => onChange(v?.id ?? null)}
      getOptionLabel={label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={fieldLabel}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
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

/** Pick several staff users with a role */
export function StaffUserMultiSelect({
  role,
  value,
  onChange,
  label: fieldLabel,
  size = 'small',
  disabled,
  helperText,
}: BaseProps & { value: string[]; onChange: (ids: string[]) => void }) {
  const { staff, isLoading } = useStaffByRole(role);
  const options = useMemo(() => staff.filter((u) => u.isActive || value.includes(u.id)), [staff, value]);
  const selected = useMemo(() => staff.filter((u) => value.includes(u.id)), [staff, value]);
  return (
    <Autocomplete<StaffUserEntity, true>
      multiple
      size={size}
      options={options}
      value={selected}
      disabled={disabled}
      loading={isLoading}
      onChange={(_, v) => onChange(v.map((u) => u.id))}
      getOptionLabel={label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => <TextField {...params} label={fieldLabel} helperText={helperText} />}
    />
  );
}

/** Staff names by ID, for history and attempts that carry only IDs */
export function useStaffNames() {
  const { isAuthenticated } = useAuthenticatedApi();
  const { data } = useStaffUserControllerFindAll(
    { take: 100, includeInActive: true },
    { query: { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 } },
  );
  return useMemo(() => {
    const names = new Map((data?.data ?? []).map((u) => [u.id, u.name]));
    return (id?: string | null) => (id ? (names.get(id) ?? '--') : undefined);
  }, [data]);
}
