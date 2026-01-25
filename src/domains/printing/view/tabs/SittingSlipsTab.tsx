'use client';

import { useMemo } from 'react';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';

import {
  PrintingControllerPreviewSittingSlipsParams,
  SittingSlipFilterDtoGender,
  SittingSlipStudent,
} from '@/providers/service/app.schemas';
import { usePrintingControllerPreviewSittingSlips } from '@/providers/service/printing/printing';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useGenerateSittingSlips, usePreviewSittingSlipDesign } from '@/hooks/usePrintingMutations';

import { extractNetworkError } from '@/utils/extractNetworkError';

import componentMessages from '../../components/messages';
import { PrintingFilters } from '../../components/PrintingFilters';
import viewMessages from '../messages';

interface FilterState {
  sessionId?: string;
  branchId?: string;
  areaId?: string;
  gender?: 'MALE' | 'FEMALE';
}

export function SittingSlipsTab() {
  const { filters } = useListingFilters<FilterState>();

  const formattedMessages = {
    grNumberHeader: useFormattedMessage(viewMessages.grNumberHeader),
    nameHeader: useFormattedMessage(viewMessages.nameHeader),
    fatherNameHeader: useFormattedMessage(viewMessages.fatherNameHeader),
    genderHeader: useFormattedMessage(viewMessages.genderHeader),
    noData: useFormattedMessage(componentMessages.noData),
    sessionRequired: useFormattedMessage(componentMessages.sessionRequired),
    generateSuccess: useFormattedMessage(componentMessages.generateSuccess),
    generateError: useFormattedMessage(componentMessages.generateError),
  };

  const previewParams: PrintingControllerPreviewSittingSlipsParams | undefined = filters.sessionId
    ? {
        sessionId: filters.sessionId,
        branchId: filters.branchId,
        areaId: filters.areaId,
        gender: filters.gender as SittingSlipFilterDtoGender,
      }
    : undefined;

  const {
    data: previewData,
    isLoading,
    isError,
    error,
  } = usePrintingControllerPreviewSittingSlips(previewParams!, {
    query: {
      enabled: !!filters.sessionId,
    },
  });

  const generateMutation = useGenerateSittingSlips();
  const previewDesignMutation = usePreviewSittingSlipDesign();

  const handleGenerate = () => {
    if (!filters.sessionId) return;

    generateMutation.mutate({
      data: {
        sessionId: filters.sessionId,
        branchId: filters.branchId,
        areaId: filters.areaId,
        gender: filters.gender as SittingSlipFilterDtoGender,
      },
    });
  };

  const handlePreviewDesign = () => {
    previewDesignMutation.mutate();
  };

  const columns: GridColDef<SittingSlipStudent>[] = useMemo(
    () => [
      { field: 'grNumber', headerName: formattedMessages.grNumberHeader, width: 150 },
      { field: 'name', headerName: formattedMessages.nameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'fatherName', headerName: formattedMessages.fatherNameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'gender', headerName: formattedMessages.genderHeader, width: 100 },
    ],
    [formattedMessages],
  );

  const isGenerating = generateMutation.isPending || previewDesignMutation.isPending;

  return (
    <Stack spacing={2}>
      <PrintingFilters documentType="sittingSlips" />

      {!filters.sessionId && (
        <Alert severity="info">
          <FormattedMessage {...componentMessages.sessionRequired} />
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {generateMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formattedMessages.generateError}
        </Alert>
      )}

      {generateMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {formattedMessages.generateSuccess}
        </Alert>
      )}

      {filters.sessionId && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">
              <FormattedMessage
                {...componentMessages.studentsFound}
                values={{ count: String(previewData?.count || 0) }}
              />
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={handlePreviewDesign} disabled={isGenerating}>
                {previewDesignMutation.isPending ? (
                  <FormattedMessage {...componentMessages.generating} />
                ) : (
                  <FormattedMessage {...componentMessages.previewDesign} />
                )}
              </Button>
              <Button variant="contained" onClick={handleGenerate} disabled={isGenerating || !previewData?.count}>
                {generateMutation.isPending ? (
                  <FormattedMessage {...componentMessages.generating} />
                ) : (
                  <FormattedMessage {...componentMessages.generate} />
                )}
              </Button>
            </Stack>
          </Stack>

          <DataTable<SittingSlipStudent>
            columns={columns}
            rows={previewData?.data || []}
            isLoading={isLoading}
            getRowId={(row) => row.grNumber}
            noDataFound={formattedMessages.noData}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </>
      )}
    </Stack>
  );
}
