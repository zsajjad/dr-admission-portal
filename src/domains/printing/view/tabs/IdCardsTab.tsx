'use client';

import { useMemo } from 'react';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { VanChip } from '@/components/VanChip';

import {
  IdCardFilterDtoGender,
  IdCardFilterDtoStatus,
  IdCardStudent,
  PrintingControllerPreviewIdCardsParams,
} from '@/providers/service/app.schemas';
import { usePrintingControllerPreviewIdCards } from '@/providers/service/printing/printing';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useGenerateIdCards, usePreviewIdCardDesign } from '@/hooks/usePrintingMutations';

import { extractNetworkError } from '@/utils/extractNetworkError';

import componentMessages from '../../components/messages';
import { PrintingFilters } from '../../components/PrintingFilters';
import viewMessages from '../messages';

interface FilterState {
  sessionId?: string;
  branchId?: string;
  areaId?: string;
  vanId?: string;
  classLevelId?: string;
  classLevelGroup?: string;
  gender?: 'MALE' | 'FEMALE';
  status?: string;
  isFeePaid?: boolean;
  isFinalized?: boolean;
}

export function IdCardsTab() {
  const { filters } = useListingFilters<FilterState>();

  const formattedMessages = {
    grNumberHeader: useFormattedMessage(viewMessages.grNumberHeader),
    nameHeader: useFormattedMessage(viewMessages.nameHeader),
    fatherNameHeader: useFormattedMessage(viewMessages.fatherNameHeader),
    genderHeader: useFormattedMessage(viewMessages.genderHeader),
    phoneHeader: useFormattedMessage(viewMessages.phoneHeader),
    areaHeader: useFormattedMessage(viewMessages.areaHeader),
    branchHeader: useFormattedMessage(viewMessages.branchHeader),
    classHeader: useFormattedMessage(viewMessages.classHeader),
    ribbonColorHeader: useFormattedMessage(viewMessages.ribbonColorHeader),
    noData: useFormattedMessage(componentMessages.noData),
    sessionRequired: useFormattedMessage(componentMessages.sessionRequired),
    generateSuccess: useFormattedMessage(componentMessages.generateSuccess),
    generateError: useFormattedMessage(componentMessages.generateError),
  };

  const previewParams: PrintingControllerPreviewIdCardsParams | undefined = filters.sessionId
    ? {
        sessionId: filters.sessionId,
        branchId: filters.branchId,
        areaId: filters.areaId,
        vanId: filters.vanId,
        classLevelId: filters.classLevelId,
        classLevelGroup: filters.classLevelGroup,
        gender: filters.gender as IdCardFilterDtoGender,
        status: filters.status as IdCardFilterDtoStatus,
        isFeePaid: filters.isFeePaid,
        isFinalized: filters.isFinalized,
      }
    : undefined;

  const {
    data: previewData,
    isLoading,
    isError,
    error,
  } = usePrintingControllerPreviewIdCards(previewParams!, {
    query: {
      enabled: !!filters.sessionId,
    },
  });

  const generateMutation = useGenerateIdCards();
  const previewDesignMutation = usePreviewIdCardDesign();

  const handleGenerate = () => {
    if (!filters.sessionId) return;

    generateMutation.mutate({
      data: {
        sessionId: filters.sessionId,
        branchId: filters.branchId,
        areaId: filters.areaId,
        vanId: filters.vanId,
        classLevelId: filters.classLevelId,
        classLevelGroup: filters.classLevelGroup,
        gender: filters.gender as IdCardFilterDtoGender,
        status: filters.status as IdCardFilterDtoStatus,
        isFeePaid: filters.isFeePaid,
        isFinalized: filters.isFinalized,
      },
    });
  };

  const handlePreviewDesign = () => {
    previewDesignMutation.mutate();
  };

  const columns: GridColDef<IdCardStudent>[] = useMemo(
    () => [
      { field: 'grNumber', headerName: formattedMessages.grNumberHeader, width: 150 },
      { field: 'name', headerName: formattedMessages.nameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'fatherName', headerName: formattedMessages.fatherNameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'gender', headerName: formattedMessages.genderHeader, width: 100 },
      { field: 'phone', headerName: formattedMessages.phoneHeader, width: 130 },
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
        width: 80,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.branch?.code,
      },
      {
        field: 'classLevel',
        headerName: formattedMessages.classHeader,
        width: 150,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.classLevel?.name,
      },
      {
        field: 'ribbonColorHex',
        headerName: formattedMessages.ribbonColorHeader,
        width: 120,
        renderCell: (params) => (
          <VanChip
            colorName={params.row.ribbonColorName}
            colorHex={params.row.ribbonColorHex}
          />
        ),
      },
    ],
    [formattedMessages],
  );

  const isGenerating = generateMutation.isPending || previewDesignMutation.isPending;

  return (
    <Stack spacing={2}>
      <PrintingFilters documentType="idCards" />

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

          <DataTable<IdCardStudent>
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
