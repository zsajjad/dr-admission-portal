'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CheckCircle as PaidIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  RemoveCircle as UnpaidIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';

import { AssetsDrawer } from '@/domains/admission/components/AssetsDrawer';
import { VanChip } from '@/domains/van/components/VanChip';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { ClassLevelChip } from '@/components/ClassLevelChip';
import { ClassLevelGroupFilter } from '@/components/ClassLevelGroupFilter';
import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';
import { SessionFilter } from '@/components/SessionFilter';

import { KEYS } from '@/providers/constants/key';
import {
  useAdmissionsControllerFindAll,
  useAdmissionsControllerMarkFeePaid,
} from '@/providers/service/admissions/admissions';
import {
  Admission,
  AdmissionsControllerFindAllSortBy,
  AdmissionsControllerFindAllStatus,
  ClassLevelGroup,
} from '@/providers/service/app.schemas';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useGenerateVerificationSlips } from '@/hooks/usePrintingMutations';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';
import { printAdmissionSlipUSB, testPrint, AdmissionSlipData } from '@/utils/thermalPrint';

import { getSafeValue, stopPropagation } from '@/utils';

import messages from './messages';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'DUPLICATE_MERGED':
      return 'warning';
    default:
      return 'default';
  }
};

// Status options for filter dropdown
const statusOptions = [
  { id: AdmissionsControllerFindAllStatus.UNVERIFIED, label: 'Unverified' },
  { id: AdmissionsControllerFindAllStatus.VERIFIED, label: 'Verified' },
  { id: AdmissionsControllerFindAllStatus.REJECTED, label: 'Rejected' },
  { id: AdmissionsControllerFindAllStatus.DUPLICATE_MERGED, label: 'Duplicate Merged' },
];

// Fee paid options for filter dropdown
const feePaidOptions = [
  { id: 'true', label: 'Paid', value: true },
  { id: 'false', label: 'Unpaid', value: false },
];

interface AdmissionFilters {
  branchId?: string;
  sessionId?: string;
  status?: string;
  areaId?: string;
  classLevelGroup?: ClassLevelGroup;
  isFeePaid?: boolean;
  name?: string;
  phone?: string;
  fatherName?: string;
}

const cardStyle = {
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  p: 2.5,
};

export function AdmissionListing() {
  const { route } = useQueryParams();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [printingQRId, setPrintingQRId] = useState<string | null>(null);
  const [testPrinting, setTestPrinting] = useState(false);

  // Local state for text search filters (applied on button click)
  const [localName, setLocalName] = useState('');
  const [localFatherName, setLocalFatherName] = useState('');
  const [localPhone, setLocalPhone] = useState('');

  // Mutations
  const markFeePaidMutation = useAdmissionsControllerMarkFeePaid();
  const generateVerificationSlipMutation = useGenerateVerificationSlips();

  const handleOpenDrawer = useCallback((admission: Admission) => {
    setSelectedAdmission(admission);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedAdmission(null);
  }, []);

  // QR Code printing handler - prints admission slip via WebUSB
  const handlePrintQR = useCallback(async (admission: Admission) => {
    const grNumber = admission.student?.grNumber;
    if (!grNumber) return;

    setPrintingQRId(admission.id);
    try {
      const slipData: AdmissionSlipData = {
        name: admission.student?.name || '',
        fatherName: admission.student?.fatherName || '',
        classLevelName: admission.classLevel?.name || '',
        gender: admission.student?.gender || '',
        grNumber: grNumber,
      };
      await printAdmissionSlipUSB(slipData);
    } catch (error) {
      console.error('Failed to print admission slip:', error);
    } finally {
      setPrintingQRId(null);
    }
  }, []);

  // Mark fee as paid/unpaid handler
  const handleToggleFeePaid = useCallback(
    (admission: Admission) => {
      markFeePaidMutation.mutate(
        {
          id: admission.id,
          data: { isFeePaid: !admission.isFeePaid },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_LISTING] });
          },
        },
      );
    },
    [markFeePaidMutation, queryClient],
  );

  // Test thermal print handler
  const handleTestPrint = useCallback(async () => {
    setTestPrinting(true);
    try {
      await testPrint();
    } catch (error) {
      console.error('Test print failed:', error);
    } finally {
      setTestPrinting(false);
    }
  }, []);

  // Print verification slip handler
  const handlePrintVerificationSlip = useCallback(
    (admission: Admission) => {
      if (!admission.session?.id) return;
      generateVerificationSlipMutation.mutate({
        data: {
          admissionIds: [admission.id],
          sessionId: admission.session.id,
        },
      });
    },
    [generateVerificationSlipMutation],
  );

  const formattedMessages = {
    errorUpdate: useFormattedMessage(messages.errorSuccess),
    noRowsLabel: useFormattedMessage(messages.noData),
    successUpdate: useFormattedMessage(messages.updateSuccess),

    //Column Names
    grNumberColumnName: useFormattedMessage(messages.grNumberColumnName),
    nameColumnName: useFormattedMessage(messages.nameColumnName),
    fatherNameColumnName: useFormattedMessage(messages.fatherNameColumnName),
    phoneColumnName: useFormattedMessage(messages.phoneColumnName),
    statusColumnName: useFormattedMessage(messages.statusColumnName),
    classLevelColumnName: useFormattedMessage(messages.classLevelColumnName),
    vanColumnName: useFormattedMessage(messages.vanColumnName),
    branchColumnName: useFormattedMessage(messages.branchColumnName),
    actionsColumnName: useFormattedMessage(messages.actionsColumnName),
    feePaidColumnName: useFormattedMessage(messages.feePaidColumnName),

    // Filter labels
    statusFilterLabel: useFormattedMessage(messages.statusFilterLabel),
    feePaidFilterLabel: useFormattedMessage(messages.feePaidFilterLabel),

    // Action messages
    printQRCode: useFormattedMessage(messages.printQRCode),
    markAsPaid: useFormattedMessage(messages.markAsPaid),
    markAsUnpaid: useFormattedMessage(messages.markAsUnpaid),
    printVerificationSlip: useFormattedMessage(messages.printVerificationSlip),
    printSlip: useFormattedMessage(messages.printSlip),
    printing: useFormattedMessage(messages.printing),
    testPrint: useFormattedMessage(messages.testPrint),
    testPrinting: useFormattedMessage(messages.testPrinting),
  };

  const { filters, setFilter, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } =
    useListingFilters<AdmissionFilters>();

  // Find selected values for controlled Autocomplete
  const selectedStatus = useMemo(() => statusOptions.find((s) => s.id === filters.status) || null, [filters.status]);
  const selectedFeePaid = useMemo(
    () => feePaidOptions.find((f) => f.value === filters.isFeePaid) || null,
    [filters.isFeePaid],
  );

  // Sync local text filter state with URL filters on initial load
  useEffect(() => {
    setLocalName(filters.name || '');
    setLocalFatherName(filters.fatherName || '');
    setLocalPhone(filters.phone || '');
  }, [filters.name, filters.fatherName, filters.phone]);

  // Apply text search filters
  const handleApplyTextFilters = useCallback(() => {
    setFilter({
      name: localName || undefined,
      fatherName: localFatherName || undefined,
      phone: localPhone || undefined,
      page: 0,
    });
  }, [localName, localFatherName, localPhone, setFilter]);

  const {
    data: admissions,
    isLoading,
    isError,
    error,
  } = useAdmissionsControllerFindAll(
    {
      sortBy: filters.sortBy as AdmissionsControllerFindAllSortBy,
      sortOrder: filters.sortOrder,
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      includeInActive: filters.includeInActive,
      branchId: filters.branchId,
      sessionId: filters.sessionId,
      areaId: filters.areaId,
      status: filters.status as AdmissionsControllerFindAllStatus,
      isFeePaid: filters.isFeePaid,
      name: filters.name,
      phone: filters.phone,
      fatherName: filters.fatherName,
      // classLevelGroup filter - will work once backend supports it
      ...(filters.classLevelGroup && { classLevelGroup: filters.classLevelGroup }),
    } as Parameters<typeof useAdmissionsControllerFindAll>[0],
    {
      query: {
        queryKey: [KEYS.ADMISSION_LISTING, filters],
      },
    },
  );

  const rowCount = useMemo(() => {
    return admissions?.count;
  }, [admissions?.count]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: filters.page,
    pageSize: filters.pageSize,
  });

  useEffect(() => {
    setPaginationModel({
      page: filters.page,
      pageSize: filters.pageSize,
    });
  }, [filters.page, filters.pageSize]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: formattedMessages.grNumberColumnName,
        width: 160,
        sortable: false,
        renderCell: (params) => getSafeValue(params.row.student?.grNumber),
      },
      {
        field: 'name',
        headerName: formattedMessages.nameColumnName,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.student?.name),
      },
      {
        field: 'fatherName',
        headerName: formattedMessages.fatherNameColumnName,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.student?.fatherName),
      },
      {
        field: 'phone',
        headerName: formattedMessages.phoneColumnName,
        flex: 1,
        maxWidth: 150,
        renderCell: (params) => getSafeValue(params.row.student?.phone),
      },
      {
        field: 'branch',
        headerName: formattedMessages.branchColumnName,
        width: 60,
        renderCell: (params) => getSafeValue(params.row.branch?.code),
      },
      {
        field: 'status',
        headerName: formattedMessages.statusColumnName,
        flex: 1,
        maxWidth: 100,
        renderCell: (params) => (
          <Chip label={params.row.status} color={getStatusColor(params.row.status)} size="small" />
        ),
      },
      {
        field: 'isFeePaid',
        headerName: formattedMessages.feePaidColumnName,
        flex: 1,
        maxWidth: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Chip
            label={params.row.isFeePaid ? 'Paid' : 'Unpaid'}
            color={params.row.isFeePaid ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'classLevel',
        headerName: formattedMessages.classLevelColumnName,
        flex: 1,
        maxWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => <ClassLevelChip classLevelId={params.row.classLevel?.id} />,
      },
      {
        field: 'van',
        headerName: formattedMessages.vanColumnName,
        flex: 1,
        maxWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <VanChip
            areaId={params.row.area?.id}
            branchId={params.row.branch?.id}
            gender={params.row.student?.gender}
            classLevelName={params.row.classLevel?.name}
            hasVan={params.row.area?.hasVan}
            hasBoysVan={params.row.area?.hasBoysVan}
          />
        ),
      },
      {
        field: 'actions',
        headerName: formattedMessages.actionsColumnName,
        renderCell: (params) => {
          const admission: Admission = params.row;
          const isUpdatingFeePaid = markFeePaidMutation.isPending && markFeePaidMutation.variables?.id === admission.id;
          const isPrintingSlip =
            generateVerificationSlipMutation.isPending &&
            generateVerificationSlipMutation.variables?.data.admissionIds?.includes(admission.id);
          const isPrintingQR = printingQRId === admission.id;

          return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Mark Fee Paid/Unpaid - Primary Action Button */}
              <Button
                size="small"
                variant={admission.isFeePaid ? 'outlined' : 'contained'}
                color={admission.isFeePaid ? 'warning' : 'success'}
                onClick={stopPropagation(() => handleToggleFeePaid(admission))}
                disabled={isUpdatingFeePaid}
                startIcon={
                  isUpdatingFeePaid ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : admission.isFeePaid ? (
                    <UnpaidIcon />
                  ) : (
                    <PaidIcon />
                  )
                }
                sx={{ minWidth: 120, textTransform: 'none' }}
              >
                {admission.isFeePaid ? formattedMessages.markAsUnpaid : formattedMessages.markAsPaid}
              </Button>

              {/* Print Slip - Primary Action Button */}
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={stopPropagation(() => handlePrintQR(admission))}
                disabled={isPrintingQR}
                startIcon={isPrintingQR ? <CircularProgress size={16} color="inherit" /> : <QrCodeIcon />}
                sx={{ minWidth: 100, textTransform: 'none' }}
              >
                {formattedMessages.printSlip}
              </Button>

              {/* Existing Row Actions (View, Edit, Print Verification Slip) */}
              <Tooltip title={formattedMessages.printVerificationSlip}>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={stopPropagation(() => handlePrintVerificationSlip(admission))}
                  disabled={isPrintingSlip}
                >
                  {isPrintingSlip ? <CircularProgress size={18} /> : <PrintIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <RowActions onEdit={() => route({ url: routes.admission.edit(admission?.id) })} />
            </Box>
          );
        },
        filterable: false,
        sortable: false,
        width: 340,
      },
    ],
    [
      formattedMessages.grNumberColumnName,
      formattedMessages.nameColumnName,
      formattedMessages.fatherNameColumnName,
      formattedMessages.phoneColumnName,
      formattedMessages.branchColumnName,
      formattedMessages.statusColumnName,
      formattedMessages.feePaidColumnName,
      formattedMessages.classLevelColumnName,
      formattedMessages.vanColumnName,
      formattedMessages.actionsColumnName,
      formattedMessages.printQRCode,
      formattedMessages.markAsPaid,
      formattedMessages.markAsUnpaid,
      formattedMessages.printVerificationSlip,
      route,
      handleOpenDrawer,
      handlePrintQR,
      handleToggleFeePaid,
      handlePrintVerificationSlip,
      markFeePaidMutation.isPending,
      markFeePaidMutation.variables?.id,
      generateVerificationSlipMutation.isPending,
      generateVerificationSlipMutation.variables?.data.admissionIds,
      printingQRId,
    ],
  );

  return (
    <Stack spacing={2.5}>
      {isError && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {/* Filter Dropdowns */}
      <Box sx={cardStyle}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
          {/* Text Search Filters */}
          <TextField
            size="small"
            sx={{ minWidth: 150 }}
            label={<FormattedMessage {...messages.nameFilterLabel} />}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          <TextField
            size="small"
            sx={{ minWidth: 150 }}
            label={<FormattedMessage {...messages.fatherNameFilterLabel} />}
            value={localFatherName}
            onChange={(e) => setLocalFatherName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          <TextField
            size="small"
            sx={{ minWidth: 150 }}
            label={<FormattedMessage {...messages.phoneFilterLabel} />}
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          {/* Dropdown Filters */}
          <BranchFilter resetFiltersOnChange={['areaId']} />
          <SessionFilter />
          <Button variant="contained" size="small" onClick={handleApplyTextFilters} startIcon={<SearchIcon />}>
            <FormattedMessage {...messages.applyFilters} />
          </Button>
          <AreaFilter />
          <ClassLevelGroupFilter />
          <Autocomplete
            size="small"
            sx={{ minWidth: 150 }}
            options={statusOptions}
            getOptionLabel={(option) => option.label}
            value={selectedStatus}
            onChange={(_, newValue) => {
              setFilter({ status: newValue?.id, page: 0 });
            }}
            renderInput={(params) => (
              <TextField {...params} label={<FormattedMessage {...messages.statusFilterLabel} />} />
            )}
          />
          <Autocomplete
            size="small"
            sx={{ minWidth: 150 }}
            options={feePaidOptions}
            getOptionLabel={(option) => option.label}
            value={selectedFeePaid}
            onChange={(_, newValue) => {
              setFilter({ isFeePaid: newValue?.value, page: 0 });
            }}
            renderInput={(params) => (
              <TextField {...params} label={<FormattedMessage {...messages.feePaidFilterLabel} />} />
            )}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleTestPrint}
            disabled={testPrinting}
            startIcon={testPrinting ? <CircularProgress size={18} /> : <PrintIcon />}
          >
            {testPrinting ? formattedMessages.testPrinting : formattedMessages.testPrint}
          </Button>
        </Stack>
      </Box>

      {/* Data Table */}
      <DataTable<Admission>
        getRowId={(row) => row?.id}
        pagination
        columns={columns}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        filterDebounceMs={500}
        isLoading={isLoading}
        rows={admissions?.data || []}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        noDataFound={formattedMessages.noRowsLabel}
        rowClickUrl={(row) => `${routes.admission.detail(row?.id?.toString())}`}
      />

      {/* Assets Drawer */}
      <AssetsDrawer open={drawerOpen} onClose={handleCloseDrawer} admission={selectedAdmission} />
    </Stack>
  );
}
