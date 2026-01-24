import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';

import { Branch, Session } from '@/providers/service/app.schemas';

export interface DashboardFiltersProps {
  branchId?: string;
  sessionId?: string;
  branches?: Branch[];
  sessions?: Session[];
  onBranchChange: (event: SelectChangeEvent<string>) => void;
  onSessionChange: (event: SelectChangeEvent<string>) => void;
  labels: {
    branch: string;
    session: string;
    allBranches: string;
    allSessions: string;
  };
}

export function DashboardFilters({
  branchId,
  sessionId,
  branches,
  sessions,
  onBranchChange,
  onSessionChange,
  labels,
}: DashboardFiltersProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="branch-filter-label">{labels.branch}</InputLabel>
        <Select
          labelId="branch-filter-label"
          id="branch-filter"
          value={branchId || ''}
          label={labels.branch}
          onChange={onBranchChange}
        >
          <MenuItem value="">{labels.allBranches}</MenuItem>
          {branches?.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="session-filter-label">{labels.session}</InputLabel>
        <Select
          labelId="session-filter-label"
          id="session-filter"
          value={sessionId || ''}
          label={labels.session}
          onChange={onSessionChange}
        >
          <MenuItem value="">{labels.allSessions}</MenuItem>
          {sessions?.map((session) => (
            <MenuItem key={session.id} value={session.id}>
              {session.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
