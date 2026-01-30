'use client';

import { useMemo, useState } from 'react';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';

import { useAdmissionsControllerFindAll } from '@/providers/service/admissions/admissions';
import { Admission, ClassLevelGroup, VerificationSlipStudent } from '@/providers/service/app.schemas';
import { usePrintingControllerPreviewVerificationSlips } from '@/providers/service/printing/printing';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useGenerateVerificationSlips, usePreviewVerificationSlipDesign } from '@/hooks/usePrintingMutations';

import { extractNetworkError } from '@/utils/extractNetworkError';

import componentMessages from '../../components/messages';
import { PrintingFilters } from '../../components/PrintingFilters';
import viewMessages from '../messages';

interface FilterState {
  name?: string;
  sessionId?: string;
  branchId?: string;
  areaId?: string;
  vanId?: string;
  classLevelId?: string;
  classLevelGroup?: ClassLevelGroup;
  gender?: 'MALE' | 'FEMALE';
  status?: 'UNVERIFIED' | 'VERIFIED' | 'CONFIRMED' | 'REJECTED' | 'MANUAL_VERIFICATION_REQUIRED';
  isFeePaid?: boolean;
  isFinalized?: boolean;
}

export function VerificationSlipsTab() {
  const [selectedAdmissionIds, setSelectedAdmissionIds] = useState<string[]>([]);
  const { filters } = useListingFilters<FilterState>();

  const formattedMessages = {
    grNumberHeader: useFormattedMessage(viewMessages.grNumberHeader),
    nameHeader: useFormattedMessage(viewMessages.nameHeader),
    fatherNameHeader: useFormattedMessage(viewMessages.fatherNameHeader),
    classHeader: useFormattedMessage(viewMessages.classHeader),
    areaHeader: useFormattedMessage(viewMessages.areaHeader),
    branchHeader: useFormattedMessage(viewMessages.branchHeader),
    noData: useFormattedMessage(componentMessages.noData),
    generateSuccess: useFormattedMessage(componentMessages.generateSuccess),
    generateError: useFormattedMessage(componentMessages.generateError),
  };

  // Fetch admissions for selection
  const {
    data: admissionsData,
    isLoading: isLoadingAdmissions,
    isError: isAdmissionsError,
    error: admissionsError,
  } = useAdmissionsControllerFindAll({
    take: 100,
    name: filters.name,
    branchId: filters.branchId,
    areaId: filters.areaId,
    classLevelId: filters.classLevelId,
    // classLevelGroup: filters.classLevelGroup,
    // gender: filters.gender,
    status: filters.status,
    isFeePaid: filters.isFeePaid,
  });

  // Preview mutation for selected admissions
  const previewMutation = usePrintingControllerPreviewVerificationSlips();

  const generateMutation = useGenerateVerificationSlips();
  const previewDesignMutation = usePreviewVerificationSlipDesign();

  const handleSelectionChange = (selectionModel: GridRowSelectionModel) => {
    // GridRowSelectionModel in v7+ is { type, ids } - extract the ids array
    const ids = Array.isArray(selectionModel) ? selectionModel : Array.from(selectionModel.ids || []);
    setSelectedAdmissionIds(ids.map(String));
  };

  const handlePreview = () => {
    if (selectedAdmissionIds.length === 0) return;
    if (!filters.sessionId) return;
    previewMutation.mutate({ data: { admissionIds: selectedAdmissionIds, sessionId: filters.sessionId } });
  };

  const handleGenerate = () => {
    if (selectedAdmissionIds.length === 0) return;
    if (!filters.sessionId) return;
    generateMutation.mutate({ data: { admissionIds: selectedAdmissionIds, sessionId: filters.sessionId } });
  };

  const handlePreviewDesign = () => {
    previewDesignMutation.mutate();
  };

  const admissionColumns: GridColDef<Admission>[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: formattedMessages.grNumberHeader,
        width: 150,
        valueGetter: (_, row) => row.student?.grNumber,
      },
      {
        field: 'name',
        headerName: formattedMessages.nameHeader,
        flex: 1,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.student?.name,
      },
      {
        field: 'fatherName',
        headerName: formattedMessages.fatherNameHeader,
        flex: 1,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.student?.fatherName,
      },
      {
        field: 'classLevel',
        headerName: formattedMessages.classHeader,
        width: 120,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.classLevel?.name,
      },
      {
        field: 'area',
        headerName: formattedMessages.areaHeader,
        flex: 1,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.area?.name,
      },
      {
        field: 'branch',
        headerName: formattedMessages.branchHeader,
        width: 120,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.branch?.name,
      },
    ],
    [formattedMessages],
  );

  const previewColumns: GridColDef<VerificationSlipStudent>[] = useMemo(
    () => [
      { field: 'grNumber', headerName: formattedMessages.grNumberHeader, width: 150 },
      { field: 'name', headerName: formattedMessages.nameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'fatherName', headerName: formattedMessages.fatherNameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'className', headerName: formattedMessages.classHeader, width: 120, cellClassName: 'font-urdu' },
      { field: 'areaName', headerName: formattedMessages.areaHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'branchName', headerName: formattedMessages.branchHeader, width: 120, cellClassName: 'font-urdu' },
    ],
    [formattedMessages],
  );

  const isGenerating = generateMutation.isPending || previewDesignMutation.isPending;

  return (
    <Stack spacing={3}>
      {/* Search and Selection */}
      <Stack spacing={2}>
        <PrintingFilters documentType="verificationSlips" />
        {isAdmissionsError && <Alert severity="error">{extractNetworkError(admissionsError)}</Alert>}

        <Typography variant="body2" color="text.secondary">
          Select admissions to generate verification slips ({selectedAdmissionIds.length} selected)
        </Typography>

        <DataTable<Admission>
          columns={admissionColumns}
          rows={admissionsData?.data || []}
          isLoading={isLoadingAdmissions}
          getRowId={(row) => row.id}
          noDataFound={formattedMessages.noData}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          rowSelectionModel={{ type: 'include', ids: new Set(selectedAdmissionIds as GridRowId[]) }}
          onRowSelectionModelChange={handleSelectionChange}
        />
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={handlePreviewDesign} disabled={isGenerating}>
          {previewDesignMutation.isPending ? (
            <FormattedMessage {...componentMessages.generating} />
          ) : (
            <FormattedMessage {...componentMessages.previewDesign} />
          )}
        </Button>
        <Button
          variant="outlined"
          onClick={handlePreview}
          disabled={selectedAdmissionIds.length === 0 || previewMutation.isPending}
        >
          Preview Data
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isGenerating || selectedAdmissionIds.length === 0}
        >
          {generateMutation.isPending ? (
            <FormattedMessage {...componentMessages.generating} />
          ) : (
            <FormattedMessage {...componentMessages.generate} />
          )}
        </Button>
      </Stack>

      {/* Error/Success Messages */}
      {generateMutation.isError && <Alert severity="error">{formattedMessages.generateError}</Alert>}

      {generateMutation.isSuccess && <Alert severity="success">{formattedMessages.generateSuccess}</Alert>}

      {/* Preview Results */}
      {previewMutation.isSuccess && previewMutation.data && (
        <Stack spacing={2}>
          <Typography variant="h6">Preview ({previewMutation.data.count} slips)</Typography>
          <DataTable<VerificationSlipStudent>
            columns={previewColumns}
            rows={previewMutation.data.data || []}
            isLoading={false}
            getRowId={(row) => row.admissionId}
            noDataFound={formattedMessages.noData}
            pageSizeOptions={[10, 25, 50]}
          />
        </Stack>
      )}
    </Stack>
  );
}
