'use client';

import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { ClassLevelFilter } from '@/components/ClassLevelFilter';
import { GenderFilter } from '@/components/GenderFilter';
import { SessionFilter } from '@/components/SessionFilter';
import { VanFilter } from '@/components/VanFilter';

import { AdmissionStatus } from '@/providers/service/app.schemas';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import viewMessages from '../view/messages';

export type DocumentType = 'idCards' | 'sittingSlips' | 'attendanceSheets' | 'verificationSlips';

interface PrintingFiltersProps {
  documentType: DocumentType;
}

interface FilterState {
  sessionId?: string;
  branchId?: string;
  areaId?: string;
  vanId?: string;
  classLevelId?: string;
  gender?: 'MALE' | 'FEMALE';
  status?: AdmissionStatus;
  isFeePaid?: boolean;
  isFinalized?: boolean;
  classLevelGroups?: string; // Stored as comma-separated string in URL
}

const STATUS_OPTIONS: AdmissionStatus[] = [
  'UNVERIFIED',
  'VERIFIED',
  'CONFIRMED',
  'REJECTED',
  'MANUAL_VERIFICATION_REQUIRED',
];

const CLASS_LEVEL_GROUP_OPTIONS = ['TIFLAN', 'MUHIBAN', 'NASIRAN'];

export function PrintingFilters({ documentType }: PrintingFiltersProps) {
  const { filters, setFilter } = useListingFilters<FilterState>();

  const formattedMessages = {
    statusFilter: useFormattedMessage(viewMessages.statusFilter),
    feePaidFilter: useFormattedMessage(viewMessages.feePaidFilter),
    finalizedFilter: useFormattedMessage(viewMessages.finalizedFilter),
    yes: useFormattedMessage(viewMessages.yes),
    no: useFormattedMessage(viewMessages.no),
    all: useFormattedMessage(viewMessages.all),
    classLevelGroups: useFormattedMessage(viewMessages.classLevelGroups),
    tiflan: useFormattedMessage(viewMessages.tiflan),
    muhiban: useFormattedMessage(viewMessages.muhiban),
    nasiran: useFormattedMessage(viewMessages.nasiran),
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilter({ status: value === '' ? undefined : (value as AdmissionStatus) });
  };

  const handleFeePaidChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilter({ isFeePaid: value === '' ? undefined : value === 'true' });
  };

  const handleFinalizedChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilter({ isFinalized: value === '' ? undefined : value === 'true' });
  };

  const handleClassLevelGroupsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const groupsArray = typeof value === 'string' ? value.split(',') : value;
    setFilter({ classLevelGroups: groupsArray.join(',') });
  };

  // Parse classLevelGroups from comma-separated string
  const classLevelGroupsArray = filters.classLevelGroups ? filters.classLevelGroups.split(',') : ['MUHIBAN', 'NASIRAN'];

  const getGroupLabel = (group: string) => {
    switch (group) {
      case 'TIFLAN':
        return formattedMessages.tiflan;
      case 'MUHIBAN':
        return formattedMessages.muhiban;
      case 'NASIRAN':
        return formattedMessages.nasiran;
      default:
        return group;
    }
  };

  // Session is required for all except verification slips
  const showSession = documentType !== 'verificationSlips';
  // Branch filter for ID cards and sitting slips
  const showBranch = documentType === 'idCards' || documentType === 'sittingSlips';
  // Area filter for ID cards, sitting slips, and attendance sheets (required for attendance)
  const showArea = documentType === 'idCards' || documentType === 'sittingSlips' || documentType === 'attendanceSheets';
  // Van filter only for ID cards
  const showVan = documentType === 'idCards';
  // Class level filter only for ID cards
  const showClassLevel = documentType === 'idCards';
  // Gender filter for ID cards, sitting slips, and attendance sheets
  const showGender =
    documentType === 'idCards' || documentType === 'sittingSlips' || documentType === 'attendanceSheets';
  // Status, fee paid, finalized filters only for ID cards
  const showStatus = documentType === 'idCards';
  const showFeePaid = documentType === 'idCards';
  const showFinalized = documentType === 'idCards';
  // Class level groups only for attendance sheets
  const showClassLevelGroups = documentType === 'attendanceSheets';

  return (
    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
      {showSession && <SessionFilter size="small" minWidth={200} />}
      {showBranch && <BranchFilter size="small" minWidth={200} resetFiltersOnChange={['areaId', 'vanId']} />}
      {showArea && <AreaFilter size="small" minWidth={200} />}
      {showVan && <VanFilter size="small" minWidth={200} />}
      {showClassLevel && <ClassLevelFilter size="small" minWidth={200} />}
      {showGender && <GenderFilter size="small" minWidth={150} />}

      {showStatus && (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>
            <FormattedMessage {...viewMessages.statusFilter} />
          </InputLabel>
          <Select value={filters.status || ''} label={formattedMessages.statusFilter} onChange={handleStatusChange}>
            <MenuItem value="">{formattedMessages.all}</MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showFeePaid && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>
            <FormattedMessage {...viewMessages.feePaidFilter} />
          </InputLabel>
          <Select
            value={filters.isFeePaid === undefined ? '' : String(filters.isFeePaid)}
            label={formattedMessages.feePaidFilter}
            onChange={handleFeePaidChange}
          >
            <MenuItem value="">{formattedMessages.all}</MenuItem>
            <MenuItem value="true">{formattedMessages.yes}</MenuItem>
            <MenuItem value="false">{formattedMessages.no}</MenuItem>
          </Select>
        </FormControl>
      )}

      {showFinalized && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>
            <FormattedMessage {...viewMessages.finalizedFilter} />
          </InputLabel>
          <Select
            value={filters.isFinalized === undefined ? '' : String(filters.isFinalized)}
            label={formattedMessages.finalizedFilter}
            onChange={handleFinalizedChange}
          >
            <MenuItem value="">{formattedMessages.all}</MenuItem>
            <MenuItem value="true">{formattedMessages.yes}</MenuItem>
            <MenuItem value="false">{formattedMessages.no}</MenuItem>
          </Select>
        </FormControl>
      )}

      {showClassLevelGroups && (
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>
            <FormattedMessage {...viewMessages.classLevelGroups} />
          </InputLabel>
          <Select
            multiple
            value={classLevelGroupsArray}
            onChange={handleClassLevelGroupsChange}
            input={<OutlinedInput label={formattedMessages.classLevelGroups} />}
            renderValue={(selected) => selected.map(getGroupLabel).join(', ')}
          >
            {CLASS_LEVEL_GROUP_OPTIONS.map((group) => (
              <MenuItem key={group} value={group}>
                <Checkbox checked={classLevelGroupsArray.includes(group)} />
                <ListItemText primary={getGroupLabel(group)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}
