'use client';

import { useMemo } from 'react';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';

import {
  AttendanceSheetFilterDtoClassLevelGroupsItem,
  AttendanceSheetFilterDtoGender,
  AttendanceStudent,
  PrintingControllerPreviewAttendanceSheetsParams,
} from '@/providers/service/app.schemas';
import { usePrintingControllerPreviewAttendanceSheets } from '@/providers/service/printing/printing';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useGenerateAttendanceSheets } from '@/hooks/usePrintingMutations';

import { extractNetworkError } from '@/utils/extractNetworkError';

import componentMessages from '../../components/messages';
import { PrintingFilters } from '../../components/PrintingFilters';
import viewMessages from '../messages';

interface FilterState {
  sessionId?: string;
  areaId?: string;
  gender?: 'MALE' | 'FEMALE';
  classLevelGroups?: string[];
}

export function AttendanceSheetsTab() {
  const { filters } = useListingFilters<FilterState>();

  const formattedMessages = {
    grNumberHeader: useFormattedMessage(viewMessages.grNumberHeader),
    nameHeader: useFormattedMessage(viewMessages.nameHeader),
    fatherNameHeader: useFormattedMessage(viewMessages.fatherNameHeader),
    genderHeader: useFormattedMessage(viewMessages.genderHeader),
    phoneHeader: useFormattedMessage(viewMessages.phoneHeader),
    classHeader: useFormattedMessage(viewMessages.classHeader),
    areaHeader: useFormattedMessage(viewMessages.areaHeader),
    noData: useFormattedMessage(componentMessages.noData),
    sessionRequired: useFormattedMessage(componentMessages.sessionRequired),
    areaRequired: useFormattedMessage(componentMessages.areaRequired),
    generateSuccess: useFormattedMessage(componentMessages.generateSuccess),
    generateError: useFormattedMessage(componentMessages.generateError),
  };

  const canPreview = filters.sessionId && filters.areaId;

  const previewParams: PrintingControllerPreviewAttendanceSheetsParams | undefined = canPreview
    ? {
        sessionId: filters.sessionId!,
        areaId: filters.areaId!,
        gender: filters.gender as AttendanceSheetFilterDtoGender,
        classLevelGroups: (filters.classLevelGroups || [
          'MUHIBAN',
          'NASIRAN',
        ]) as AttendanceSheetFilterDtoClassLevelGroupsItem[],
      }
    : undefined;

  const {
    data: previewData,
    isLoading,
    isError,
    error,
  } = usePrintingControllerPreviewAttendanceSheets(previewParams!, {
    query: {
      enabled: !!canPreview,
    },
  });

  const generateMutation = useGenerateAttendanceSheets();

  const handleGenerate = () => {
    if (!canPreview) return;

    generateMutation.mutate({
      data: {
        sessionId: filters.sessionId!,
        areaId: filters.areaId!,
        gender: filters.gender as AttendanceSheetFilterDtoGender,
        classLevelGroups: (filters.classLevelGroups || [
          'MUHIBAN',
          'NASIRAN',
        ]) as AttendanceSheetFilterDtoClassLevelGroupsItem[],
      },
    });
  };

  const columns: GridColDef<AttendanceStudent>[] = useMemo(
    () => [
      { field: 'grNumber', headerName: formattedMessages.grNumberHeader, width: 150 },
      { field: 'name', headerName: formattedMessages.nameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'fatherName', headerName: formattedMessages.fatherNameHeader, flex: 1, cellClassName: 'font-urdu' },
      { field: 'gender', headerName: formattedMessages.genderHeader, width: 100 },
      { field: 'phone', headerName: formattedMessages.phoneHeader, width: 130 },
      { field: 'className', headerName: formattedMessages.classHeader, width: 120, cellClassName: 'font-urdu' },
      { field: 'areaName', headerName: formattedMessages.areaHeader, flex: 1, cellClassName: 'font-urdu' },
    ],
    [formattedMessages],
  );

  const isGenerating = generateMutation.isPending;

  return (
    <Stack spacing={2}>
      <PrintingFilters documentType="attendanceSheets" />

      {!filters.sessionId && (
        <Alert severity="info">
          <FormattedMessage {...componentMessages.sessionRequired} />
        </Alert>
      )}

      {filters.sessionId && !filters.areaId && (
        <Alert severity="info">
          <FormattedMessage {...componentMessages.areaRequired} />
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

      {canPreview && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack>
              <Typography variant="body1">
                <FormattedMessage
                  {...componentMessages.studentsFound}
                  values={{ count: String(previewData?.count || 0) }}
                />
              </Typography>
              {previewData?.areaName && (
                <Typography variant="body2" color="text.secondary" className="font-urdu">
                  {previewData.areaName} ({previewData.areaAlias})
                </Typography>
              )}
            </Stack>
            <Button variant="contained" onClick={handleGenerate} disabled={isGenerating || !previewData?.count}>
              {generateMutation.isPending ? (
                <FormattedMessage {...componentMessages.generating} />
              ) : (
                <FormattedMessage {...componentMessages.generate} />
              )}
            </Button>
          </Stack>

          <DataTable<AttendanceStudent>
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
