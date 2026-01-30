'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { ClassLevelFilter } from '@/components/ClassLevelFilter';
import ClassLevelGroupFilter from '@/components/ClassLevelGroupFilter';
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

  // Session is required for all except verification slips
  const showSession = documentType !== 'verificationSlips';
  // Branch filter for ID cards and sitting slips
  const showBranch = documentType === 'idCards' || documentType === 'sittingSlips' || documentType === 'verificationSlips';
  // Area filter for ID cards, sitting slips, and attendance sheets (required for attendance)
  const showArea = documentType === 'idCards' || documentType === 'sittingSlips' || documentType === 'attendanceSheets' || documentType === 'verificationSlips';
  // Van filter only for ID cards
  const showVan = documentType === 'idCards' || documentType === 'verificationSlips';
  // Class level filter only for ID cards
  const showClassLevel = documentType === 'idCards' || documentType === 'verificationSlips';
  // Gender filter for ID cards, sitting slips, and attendance sheets
  const showGender =
    documentType === 'idCards' || documentType === 'sittingSlips' || documentType === 'attendanceSheets' || documentType === 'verificationSlips';
  // Status, fee paid, finalized filters only for ID cards
  const showStatus = documentType === 'idCards' || documentType === 'verificationSlips';
  const showFeePaid = documentType === 'idCards' || documentType === 'verificationSlips';
  const showFinalized = documentType === 'idCards' || documentType === 'verificationSlips';
  // Class level groups only for attendance sheets
  const showClassLevelGroups = documentType === 'attendanceSheets' || documentType === 'verificationSlips' || documentType === 'idCards';

  return (
    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
      {showSession && <SessionFilter size="small" minWidth={200} />}
      {showBranch && <BranchFilter size="small" minWidth={200} resetFiltersOnChange={['areaId', 'vanId']} />}
      {showArea && <AreaFilter size="small" minWidth={200} />}
      {showVan && <VanFilter size="small" minWidth={200} />}
      {showClassLevel && <ClassLevelFilter size="small" minWidth={200} />}
      {showClassLevelGroups && <ClassLevelGroupFilter size="small" minWidth={200} />}
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
    </Stack>
  );
}
