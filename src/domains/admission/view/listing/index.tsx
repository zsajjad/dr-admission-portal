'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  CheckCircle as PaidIcon,
  Edit as EditIcon,
  FactCheck as VerifyIcon,
  Person as ProfileIcon,
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

import { AssetsDrawer } from '@/domains/admission/components/AssetsDrawer';
import { admissionStatusMessage } from '@/domains/students/utils';
import { VanChip } from '@/domains/van/components/VanChip';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { ClassLevelChip } from '@/components/ClassLevelChip';
import { ClassLevelFilter } from '@/components/ClassLevelFilter';
import { ClassLevelGroupFilter } from '@/components/ClassLevelGroupFilter';
import { DataTable } from '@/components/DataTable';
import { GenderFilter } from '@/components/GenderFilter';
import rowActionMessages from '@/components/RowActions/messages';
import { RowMenu, RowMenuItem } from '@/components/RowMenu';
import { SessionFilter } from '@/components/SessionFilter';
import { PrinterStatus, useSlipPrinter } from '@/components/ThermalPrinter';

import { KEYS } from '@/providers/constants/key';
import {
  useAdmissionsControllerFindAll,
  useAdmissionsControllerMarkFeePaid,
} from '@/providers/service/admissions/admissions';
import {
  Admission,
  AdmissionsControllerFindAllSortBy,
  AdmissionStatus,
  ClassLevelGroup,
  QuestionSet,
} from '@/providers/service/app.schemas';
import { useQuestionSetControllerFindAll } from '@/providers/service/question-set/question-set';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useGenerateVerificationSlips } from '@/hooks/usePrintingMutations';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';
import { AdmissionSlipData } from '@/utils/thermalPrinter';

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
    case 'MANUAL_VERIFICATION_REQUIRED':
      return 'warning';
    default:
      return 'default';
  }
};

// Status options for filter dropdown
const statusOptions = [
  { id: AdmissionStatus.UNVERIFIED, label: 'Unverified' },
  { id: AdmissionStatus.VERIFIED, label: 'Verified' },
  { id: AdmissionStatus.REJECTED, label: 'Rejected' },
  { id: AdmissionStatus.DUPLICATE_MERGED, label: 'Duplicate Merged' },
  { id: AdmissionStatus.MANUAL_VERIFICATION_REQUIRED, label: 'Manual Verification Required' },
];

// Fee paid options for filter dropdown
const feePaidOptions: { id: string; label: string; value: boolean | undefined }[] = [
  { id: 'all', label: 'All', value: undefined },
  { id: 'true', label: 'Paid', value: true },
  { id: 'false', label: 'Unpaid', value: false },
];

interface AdmissionFilters {
  branchId?: string;
  sessionId?: string;
  status?: string;
  areaId?: string;
  classLevelId?: string;
  classLevelGroup?: ClassLevelGroup;
  isFeePaid?: boolean;
  gender?: 'MALE' | 'FEMALE';
  grNumber?: string;
  name?: string;
  phone?: string;
  fatherName?: string;
}

/** A cell with a main line and a quieter one under it. */
function TwoLineCell({
  first,
  second,
  tooltip,
  strong,
  ltr,
}: {
  first: string;
  second?: string | null;
  /** What the second line is, shown on hover */
  tooltip: string;
  strong?: boolean;
  /** Numbers (GR, phone) read left to right in Urdu too */
  ltr?: boolean;
}) {
  return (
    <Box
      dir={ltr ? 'ltr' : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0,
        lineHeight: 1.35,
        '& > *': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      }}
    >
      <Box component="span" title={first} sx={{ fontWeight: strong ? 600 : 400 }}>
        {first}
      </Box>
      {second ? (
        <Box component="span" title={`${tooltip}: ${second}`} sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {second}
        </Box>
      ) : null}
    </Box>
  );
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
  const { printSlip, printingKey, errorDialog: slipErrorDialog } = useSlipPrinter();

  // Local state for text search filters (applied on button click)
  const [localGrNumber, setLocalGrNumber] = useState('');
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

  // Test print: a sample slip, to check the printer before the queue starts
  const handleTestPrint = useCallback(() => {
    void printSlip('test', {
      name: 'Test Student',
      fatherName: 'Test Father',
      classLevelName: 'Test Class',
      gender: 'Male',
      grNumber: 'TEST-0000',
    });
  }, [printSlip]);

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
    edit: useFormattedMessage(rowActionMessages.edit),
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
    verify: useFormattedMessage(messages.verify),
    studentProfile: useFormattedMessage(messages.studentProfile),
  };

  const { filters, setFilter, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } =
    useListingFilters<AdmissionFilters>();

  // Fetch question sets for the current session to check if interaction is required
  const { data: questionSetsData } = useQuestionSetControllerFindAll(
    { sessionId: filters.sessionId },
    // { query: { enabled: !!filters.sessionId } },
  );

  // Helper to check if interaction is required for an admission
  // Returns true if a questionSet exists for this classLevel+gender and no interaction has been done yet
  const checkInteractionRequired = useCallback(
    (admission: Admission): boolean => {
      // If interaction already exists, not required
      if (admission.interaction) return false;

      // Check if any questionSet matches this admission's classLevel and gender
      const questionSets = questionSetsData?.data || [];
      return questionSets.some(
        (qs: QuestionSet) =>
          qs.classLevel?.id === admission.classLevel?.id && qs.classLevel?.gender === admission.student?.gender,
      );
    },
    [questionSetsData?.data],
  );

  // Prints the admission slip on the receipt printer; failures open the print error dialog
  const handlePrintQR = useCallback(
    (admission: Admission) => {
      const grNumber = admission.student?.grNumber;
      if (!grNumber) return;

      const slipData: AdmissionSlipData = {
        name: admission.student?.name || '',
        fatherName: admission.student?.fatherName || '',
        classLevelName: admission.classLevel?.name || '',
        gender: admission.student?.gender || '',
        grNumber,
        isInteractionRequired: checkInteractionRequired(admission),
      };
      void printSlip(admission.id, slipData);
    },
    [checkInteractionRequired, printSlip],
  );

  // Find selected values for controlled Autocomplete
  const selectedStatus = useMemo(() => statusOptions.find((s) => s.id === filters.status) || null, [filters.status]);
  const selectedFeePaid = useMemo(
    () => feePaidOptions.find((f) => f.value === filters.isFeePaid) || feePaidOptions[0],
    [filters.isFeePaid],
  );

  // Sync local text filter state with URL filters on initial load
  useEffect(() => {
    setLocalGrNumber(filters.grNumber || '');
    setLocalName(filters.name || '');
    setLocalFatherName(filters.fatherName || '');
    setLocalPhone(filters.phone || '');
  }, [filters.grNumber, filters.name, filters.fatherName, filters.phone]);

  // Apply text search filters
  const handleApplyTextFilters = useCallback(() => {
    setFilter({
      grNumber: localGrNumber || undefined,
      name: localName || undefined,
      fatherName: localFatherName || undefined,
      phone: localPhone || undefined,
      page: 0,
    });
  }, [localGrNumber, localName, localFatherName, localPhone, setFilter]);

  // Valid sortBy values for the API
  const validSortBy = filters.sortBy as AdmissionsControllerFindAllSortBy;
  const sortBy =
    validSortBy && ['createdAt', 'updatedAt', 'status', 'isFeePaid'].includes(validSortBy)
      ? validSortBy
      : AdmissionsControllerFindAllSortBy.updatedAt;

  const {
    data: admissions,
    isLoading,
    isError,
    error,
  } = useAdmissionsControllerFindAll(
    {
      sortBy,
      sortOrder: filters.sortOrder || 'desc',
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      includeInActive: filters.includeInActive,
      branchId: filters.branchId,
      sessionId: filters.sessionId,
      areaId: filters.areaId,
      status: filters.status,
      isFeePaid: filters.isFeePaid,
      gender: filters.gender,
      grNumber: filters.grNumber,
      name: filters.name,
      phone: filters.phone,
      fatherName: filters.fatherName,
      classLevelId: filters.classLevelId,
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

  const tooltipSlotProps = {
    tooltip: { sx: { bgcolor: 'primary.dark', color: 'white' } },
    arrow: { sx: { color: 'primary.dark' } },
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        // The GR number with the phone under it, so the row's actions fit without scrolling sideways.
        field: 'grNumber',
        headerName: formattedMessages.grNumberColumnName,
        width: 160,
        sortable: false,
        renderCell: (params) => (
          <TwoLineCell
            first={getSafeValue(params.row.student?.grNumber)}
            second={params.row.student?.phone}
            tooltip={formattedMessages.phoneColumnName}
            ltr
          />
        ),
      },
      {
        // The student with the father's name under it.
        field: 'name',
        headerName: formattedMessages.nameColumnName,
        minWidth: 180,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <TwoLineCell
            first={getSafeValue(params.row.student?.name)}
            second={params.row.student?.fatherName}
            tooltip={formattedMessages.fatherNameColumnName}
            strong
          />
        ),
      },
      {
        field: 'branch',
        headerName: formattedMessages.branchColumnName,
        width: 76,
        sortable: false,
        renderCell: (params) => {
          const value = getSafeValue(params.row.branch?.code);
          return (
            <Tooltip title={value} arrow slotProps={tooltipSlotProps}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      {
        field: 'status',
        headerName: formattedMessages.statusColumnName,
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const label = <FormattedMessage {...admissionStatusMessage(params.row.status)} />;
          return (
            <Tooltip title={label} arrow slotProps={tooltipSlotProps}>
              <Chip label={label} color={getStatusColor(params.row.status)} size="small" />
            </Tooltip>
          );
        },
      },
      {
        field: 'isFeePaid',
        headerName: formattedMessages.feePaidColumnName,
        width: 90,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const label = params.row.isFeePaid ? 'Paid' : 'Unpaid';
          return (
            <Tooltip title={label} arrow slotProps={tooltipSlotProps}>
              <Chip label={label} color={params.row.isFeePaid ? 'success' : 'default'} size="small" />
            </Tooltip>
          );
        },
      },
      {
        field: 'classLevel',
        headerName: formattedMessages.classLevelColumnName,
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const classLevelName = getSafeValue(params.row.classLevel?.name);
          return (
            <Tooltip title={classLevelName} arrow slotProps={tooltipSlotProps}>
              <span>
                <ClassLevelChip classLevelId={params.row.classLevel?.id} />
              </span>
            </Tooltip>
          );
        },
      },
      {
        field: 'van',
        headerName: formattedMessages.vanColumnName,
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const areaName = getSafeValue(params.row.area?.name);
          return (
            <Tooltip title={areaName} arrow slotProps={tooltipSlotProps}>
              <span>
                <VanChip
                  areaId={params.row.area?.id}
                  branchId={params.row.branch?.id}
                  gender={params.row.student?.gender}
                  classLevelName={params.row.classLevel?.name}
                  hasVan={params.row.area?.hasVan}
                  hasBoysVan={params.row.area?.hasBoysVan}
                />
              </span>
            </Tooltip>
          );
        },
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
          const isPrintingQR = printingKey === admission.id;
          const canVerify =
            admission.status === 'UNVERIFIED' ||
            admission.status === 'MANUAL_VERIFICATION_REQUIRED' ||
            admission.status === 'REJECTED';

          // Less used actions, behind the ⋮ at the end of the row.
          const menuItems: RowMenuItem[] = [
            ...(canVerify
              ? [
                  {
                    key: 'verify',
                    label: formattedMessages.verify,
                    icon: <VerifyIcon fontSize="small" color="warning" />,
                    onClick: () => handleOpenDrawer(admission),
                  },
                ]
              : []),
            {
              key: 'verification-slip',
              label: formattedMessages.printVerificationSlip,
              icon: isPrintingSlip ? <CircularProgress size={18} /> : <PrintIcon fontSize="small" />,
              onClick: () => handlePrintVerificationSlip(admission),
              disabled: isPrintingSlip,
            },
            ...(admission.student?.id
              ? [
                  {
                    key: 'profile',
                    label: formattedMessages.studentProfile,
                    icon: <ProfileIcon fontSize="small" />,
                    onClick: () => route({ url: routes.students.profile(admission.student.id) }),
                  },
                ]
              : []),
            {
              key: 'edit',
              label: formattedMessages.edit,
              icon: <EditIcon fontSize="small" />,
              onClick: () => route({ url: routes.admission.edit(admission?.id) }),
            },
          ];

          return (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
              {/* Mark Fee Paid/Unpaid - the row's main button */}
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
                sx={{ minWidth: 120, textTransform: 'none', whiteSpace: 'nowrap', mr: 0.5 }}
              >
                {admission.isFeePaid ? formattedMessages.markAsUnpaid : formattedMessages.markAsPaid}
              </Button>

              {/* Print Slip */}
              <Tooltip title={formattedMessages.printSlip}>
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    aria-label={formattedMessages.printSlip}
                    onClick={stopPropagation(() => handlePrintQR(admission))}
                    disabled={isPrintingQR}
                  >
                    {isPrintingQR ? <CircularProgress size={18} /> : <QrCodeIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>

              <RowMenu items={menuItems} />
            </Box>
          );
        },
        filterable: false,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        width: 236,
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
      formattedMessages.printSlip,
      formattedMessages.markAsPaid,
      formattedMessages.markAsUnpaid,
      formattedMessages.printVerificationSlip,
      formattedMessages.verify,
      formattedMessages.studentProfile,
      formattedMessages.edit,
      route,
      handleOpenDrawer,
      handlePrintQR,
      handleToggleFeePaid,
      handlePrintVerificationSlip,
      markFeePaidMutation.isPending,
      markFeePaidMutation.variables?.id,
      generateVerificationSlipMutation.isPending,
      generateVerificationSlipMutation.variables?.data.admissionIds,
      printingKey,
    ],
  );

  return (
    <Stack spacing={2.5}>
      {isError && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {/* Filters: two aligned rows of six, then the search button with the slip printer beside it */}
      <Box sx={cardStyle}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))',
            },
          }}
        >
          {/* Text Search Filters */}
          <TextField
            size="small"
            label={<FormattedMessage {...messages.grNumberFilterLabel} />}
            value={localGrNumber}
            onChange={(e) => setLocalGrNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          <TextField
            size="small"
            label={<FormattedMessage {...messages.nameFilterLabel} />}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          <TextField
            size="small"
            label={<FormattedMessage {...messages.fatherNameFilterLabel} />}
            value={localFatherName}
            onChange={(e) => setLocalFatherName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          <TextField
            size="small"
            label={<FormattedMessage {...messages.phoneFilterLabel} />}
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyTextFilters()}
          />
          {/* Dropdown Filters */}
          <BranchFilter minWidth={0} resetFiltersOnChange={['areaId']} />
          <SessionFilter minWidth={0} />
          <AreaFilter minWidth={0} />
          <ClassLevelFilter
            minWidth={0}
            onClassLevelChange={(classLevelId) => {
              // Avoid applying both group + specific level at once.
              // IMPORTANT: include classLevelId here so we don't overwrite
              // the URL state with a version that doesn't yet have it.
              setFilter({ classLevelId, classLevelGroup: undefined, page: 0 });
            }}
          />
          <ClassLevelGroupFilter minWidth={0} />
          <GenderFilter size="small" minWidth={0} />
          <Autocomplete
            size="small"
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
        </Box>
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 2 }}
        >
          <PrinterStatus onTestPrint={handleTestPrint} isTestPrinting={printingKey === 'test'} />
          <Button variant="contained" size="small" onClick={handleApplyTextFilters} startIcon={<SearchIcon />}>
            <FormattedMessage {...messages.applyFilters} />
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
        rowHeight={56}
      />

      {/* Assets Drawer */}
      <AssetsDrawer open={drawerOpen} onClose={handleCloseDrawer} admission={selectedAdmission} />

      {slipErrorDialog}
    </Stack>
  );
}
