'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { AssetUploader } from '@/components/Asset/Uploader';
import { DataTable } from '@/components/DataTable';

import {
  useAdmissionsControllerCreate,
  useAdmissionsControllerSearchLegacy,
} from '@/providers/service/admissions/admissions';
import {
  Area,
  AssetsControllerUploadPublicType,
  Branch,
  CreateAdmissionDtoGender,
  LegacyStudentRow,
  Session,
} from '@/providers/service/app.schemas';
import { useAreaControllerFindAll } from '@/providers/service/area/area';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';

import { getSafeValue } from '@/utils';

import messages from './messages';

const cardStyle = {
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  p: 2.5,
};

interface CreateAdmissionFormValues {
  sessionId: string;
  branchId: string;
  areaId: string;
  name: string;
  fatherName: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: CreateAdmissionDtoGender;
  address?: string;
  identityNumber?: string;
  schoolName?: string;
  schoolClass?: string;
  lastYearClass?: string;
  vanRequired: boolean;
  isMarried: boolean;
  isWorking: boolean;
  legacyStudentId: string;
  identityProofAssetId?: string;
}

export function FromLegacyAdmission(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<LegacyStudentRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Translated messages
  const formattedMessages = {
    searchPlaceholder: useFormattedMessage(messages.searchPlaceholder),
    noResultsFound: useFormattedMessage(messages.noResultsFound),
    noSearchPerformed: useFormattedMessage(messages.noSearchPerformed),

    // Columns
    grNumberColumn: useFormattedMessage(messages.grNumberColumn),
    nameColumn: useFormattedMessage(messages.nameColumn),
    fatherNameColumn: useFormattedMessage(messages.fatherNameColumn),
    phoneColumn: useFormattedMessage(messages.phoneColumn),
    genderColumn: useFormattedMessage(messages.genderColumn),
    statusColumn: useFormattedMessage(messages.statusColumn),
    actionsColumn: useFormattedMessage(messages.actionsColumn),

    // Form placeholders
    namePlaceholder: useFormattedMessage(messages.namePlaceholder),
    fatherNamePlaceholder: useFormattedMessage(messages.fatherNamePlaceholder),
    phonePlaceholder: useFormattedMessage(messages.phonePlaceholder),
    alternatePhonePlaceholder: useFormattedMessage(messages.alternatePhonePlaceholder),
    addressPlaceholder: useFormattedMessage(messages.addressPlaceholder),
    identityNumberPlaceholder: useFormattedMessage(messages.identityNumberPlaceholder),
    schoolNamePlaceholder: useFormattedMessage(messages.schoolNamePlaceholder),
    schoolClassPlaceholder: useFormattedMessage(messages.schoolClassPlaceholder),
    lastYearClassPlaceholder: useFormattedMessage(messages.lastYearClassPlaceholder),

    // Validation errors
    nameRequiredError: useFormattedMessage(messages.nameRequiredError),
    fatherNameRequiredError: useFormattedMessage(messages.fatherNameRequiredError),
    phoneRequiredError: useFormattedMessage(messages.phoneRequiredError),
    dateOfBirthRequiredError: useFormattedMessage(messages.dateOfBirthRequiredError),
    genderRequiredError: useFormattedMessage(messages.genderRequiredError),
    branchRequiredError: useFormattedMessage(messages.branchRequiredError),
    areaRequiredError: useFormattedMessage(messages.areaRequiredError),
    sessionRequiredError: useFormattedMessage(messages.sessionRequiredError),

    // Success/Error
    createSuccess: useFormattedMessage(messages.createSuccess),
    createError: useFormattedMessage(messages.createError),

    // Asset uploader
    identityProofLabel: useFormattedMessage(messages.identityProofLabel),
    identityProofHelperText: useFormattedMessage(messages.identityProofHelperText),
  };

  // Fetch sessions, branches, areas for dropdowns
  const { data: sessionsData } = useSessionControllerFindAll({ take: 100 });
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const { data: areasData } = useAreaControllerFindAll({ take: 500 });

  const sessions = useMemo(() => sessionsData?.data || [], [sessionsData?.data]);
  const branches = useMemo(() => branchesData?.data || [], [branchesData?.data]);
  const areas = useMemo(() => areasData?.data || [], [areasData?.data]);

  // Legacy search query
  const {
    data: searchResults,
    isLoading: isSearching,
    isError: searchError,
    error: searchErrorData,
  } = useAdmissionsControllerSearchLegacy(
    { query: submittedQuery, take: 50 },
    {
      query: {
        enabled: !!submittedQuery,
      },
    },
  );

  // Create admission mutation
  const createAdmissionMutation = useAdmissionsControllerCreate();

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
    }
  }, [searchQuery]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleOpenDialog = useCallback((student: LegacyStudentRow) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedStudent(null);
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation schema
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        sessionId: Yup.string().required(formattedMessages.sessionRequiredError),
        branchId: Yup.string().required(formattedMessages.branchRequiredError),
        areaId: Yup.string().required(formattedMessages.areaRequiredError),
        name: Yup.string().required(formattedMessages.nameRequiredError),
        fatherName: Yup.string().required(formattedMessages.fatherNameRequiredError),
        phone: Yup.string().required(formattedMessages.phoneRequiredError),
        dateOfBirth: Yup.string().required(formattedMessages.dateOfBirthRequiredError),
        gender: Yup.string().required(formattedMessages.genderRequiredError),
      }),
    [formattedMessages],
  );

  // Get initial values from selected student's prefill data
  const getInitialValues = useCallback(
    (student: LegacyStudentRow | null): CreateAdmissionFormValues => {
      const prefill = student?.prefill;
      return {
        sessionId: sessions[0]?.id || '',
        branchId: prefill?.branchId || '',
        areaId: prefill?.areaId || '',
        name: prefill?.name || '',
        fatherName: prefill?.fatherName || '',
        phone: prefill?.phone || '',
        alternatePhone: prefill?.alternatePhone || '',
        dateOfBirth: prefill?.dateOfBirth ? format(new Date(prefill.dateOfBirth), 'yyyy-MM-dd') : '',
        gender: (prefill?.gender as CreateAdmissionDtoGender) || CreateAdmissionDtoGender.MALE,
        address: prefill?.address || '',
        identityNumber: prefill?.identityNumber || '',
        schoolName: prefill?.schoolName || '',
        schoolClass: prefill?.schoolClass || '',
        lastYearClass: prefill?.lastYearClass || '',
        vanRequired: prefill?.vanRequired || false,
        isMarried: prefill?.isMarried || false,
        isWorking: prefill?.isWorking || false,
        legacyStudentId: student?.id || '',
        identityProofAssetId: undefined,
      };
    },
    [sessions],
  );

  // Define submission handler ref to avoid circular dependency
  const submitValuesRef = React.useRef<(values: CreateAdmissionFormValues) => void>(() => {});

  const formik = useFormik<CreateAdmissionFormValues>({
    initialValues: getInitialValues(null),
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitValuesRef.current(values);
    },
  });

  const { onSuccess, onError } = useMutationHandlers({
    messages: {
      successUpdate: formattedMessages.createSuccess,
      errorUpdate: formattedMessages.createError,
    },
    setSubmitting: (submitting) => formik.setSubmitting(submitting),
    setStatus: formik.setStatus,
    redirectTo: routes.admission.listing,
  });

  // Update the ref with the actual submit handler
  React.useEffect(() => {
    submitValuesRef.current = (values: CreateAdmissionFormValues) => {
      createAdmissionMutation.mutate(
        {
          data: {
            sessionId: values.sessionId,
            branchId: values.branchId,
            areaId: values.areaId,
            name: values.name,
            fatherName: values.fatherName,
            phone: values.phone,
            alternatePhone: values.alternatePhone || undefined,
            dateOfBirth: values.dateOfBirth,
            gender: values.gender,
            address: values.address || undefined,
            identityNumber: values.identityNumber || undefined,
            schoolName: values.schoolName || undefined,
            schoolClass: values.schoolClass || undefined,
            lastYearClass: values.lastYearClass || undefined,
            vanRequired: values.vanRequired,
            isMarried: values.isMarried,
            isWorking: values.isWorking,
            legacyStudentId: values.legacyStudentId,
            identityProofAssetId: values.identityProofAssetId || undefined,
          },
        },
        { onSuccess, onError },
      );
    };
  }, [createAdmissionMutation, onSuccess, onError]);

  // Update form values when student is selected
  React.useEffect(() => {
    if (selectedStudent) {
      const newValues = getInitialValues(selectedStudent);
      formik.setValues(newValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent, getInitialValues]);

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue } = formik;

  // Filter areas based on selected branch
  const filteredAreas = useMemo(() => {
    if (!values.branchId) return areas;
    return areas.filter((area) => area.branch?.id === values.branchId);
  }, [areas, values.branchId]);

  // Find selected values for Autocomplete components
  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === values.sessionId) || null,
    [sessions, values.sessionId],
  );
  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === values.branchId) || null,
    [branches, values.branchId],
  );
  const selectedArea = useMemo(
    () => filteredAreas.find((a) => a.id === values.areaId) || null,
    [filteredAreas, values.areaId],
  );

  const columns: GridColDef<LegacyStudentRow>[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: formattedMessages.grNumberColumn,
        flex: 1,
        maxWidth: 150,
        sortable: false,
        renderCell: (params) => getSafeValue(params.row.grNumber),
      },
      {
        field: 'name',
        headerName: formattedMessages.nameColumn,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.name),
      },
      {
        field: 'fatherName',
        headerName: formattedMessages.fatherNameColumn,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.fatherName),
      },
      {
        field: 'phone',
        headerName: formattedMessages.phoneColumn,
        flex: 1,
        maxWidth: 150,
        renderCell: (params) => getSafeValue(params.row.phone),
      },
      {
        field: 'gender',
        headerName: formattedMessages.genderColumn,
        flex: 0.5,
        maxWidth: 100,
        renderCell: (params) => getSafeValue(params.row.gender),
      },
      {
        field: 'status',
        headerName: formattedMessages.statusColumn,
        flex: 1,
        maxWidth: 180,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1} alignItems="center">
            {params.row.alreadyRegistered ? (
              <Chip label={<FormattedMessage {...messages.alreadyRegistered} />} color="warning" size="small" />
            ) : (
              <Chip label={<FormattedMessage {...messages.notRegistered} />} color="success" size="small" />
            )}
            {params.row.warnings && params.row.warnings.length > 0 && (
              <Tooltip title={params.row.warnings.join(', ')}>
                <WarningAmberIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
        ),
      },
      {
        field: 'actions',
        headerName: formattedMessages.actionsColumn,
        flex: 1,
        maxWidth: 180,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={params.row.alreadyRegistered}
            onClick={() => handleOpenDialog(params.row)}
          >
            <FormattedMessage {...messages.createAdmission} />
          </Button>
        ),
      },
    ],
    [formattedMessages, handleOpenDialog],
  );

  return (
    <Stack spacing={2.5}>
      {/* Search Section */}
      <Box sx={cardStyle}>
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
          <FormattedMessage {...messages.searchTitle} />
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={formattedMessages.searchPlaceholder}
            helperText={<FormattedMessage {...messages.searchHelperText} />}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { xs: '100%', sm: 500 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: 'action.hover',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
                '&.Mui-focused': {
                  backgroundColor: 'background.paper',
                },
              },
              '& .MuiInputBase-input': {
                py: 1.5,
                px: 1,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 120,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              },
            }}
          >
            <FormattedMessage {...messages.searchButton} />
          </Button>
        </Stack>
      </Box>

      {/* Results Section */}
      {searchError && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {String(searchErrorData)}
        </Alert>
      )}

      {submittedQuery ? (
        <DataTable<LegacyStudentRow>
          getRowId={(row) => row.id}
          columns={columns}
          rows={searchResults?.data || []}
          isLoading={isSearching}
          rowCount={searchResults?.count || 0}
          noDataFound={formattedMessages.noResultsFound}
        />
      ) : (
        <Box sx={{ ...cardStyle, textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            <FormattedMessage {...messages.noSearchPerformed} />
          </Typography>
        </Box>
      )}

      {/* Create Admission Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <FormattedMessage {...messages.createAdmissionTitle} />
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            <FormattedMessage {...messages.createAdmissionDescription} />
          </Typography>

          {/* Show warnings if any */}
          {selectedStudent?.warnings && selectedStudent.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <FormattedMessage {...messages.warningsTitle} />
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {selectedStudent.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Show legacy raw data */}
          {selectedStudent?.raw && (selectedStudent.raw.area || selectedStudent.raw.city) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <FormattedMessage {...messages.rawDataTitle} />
              </Typography>
              <Stack direction="row" spacing={3}>
                {selectedStudent.raw.area && (
                  <Typography variant="body2">
                    <FormattedMessage {...messages.legacyArea} />: {selectedStudent.raw.area}
                  </Typography>
                )}
                {selectedStudent.raw.city && (
                  <Typography variant="body2">
                    <FormattedMessage {...messages.legacyCity} />: {selectedStudent.raw.city}
                  </Typography>
                )}
              </Stack>
            </Alert>
          )}

          {formik.status && typeof formik.status === 'string' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formik.status}
            </Alert>
          )}

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            {/* Session, Branch, Area Selection */}
            <Typography variant="h6">
              <FormattedMessage {...messages.admissionInfoSection} />
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete<Session, false>
                  size="small"
                  options={sessions}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedSession}
                  onChange={(_, newValue) => setFieldValue('sessionId', newValue?.id || '')}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id} className="font-urdu">
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage {...messages.sessionLabel} />}
                      error={touched.sessionId && Boolean(errors.sessionId)}
                      helperText={touched.sessionId && errors.sessionId}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete<Branch, false>
                  size="small"
                  options={branches}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedBranch}
                  onChange={(_, newValue) => {
                    setFieldValue('branchId', newValue?.id || '');
                    setFieldValue('areaId', ''); // Reset area when branch changes
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name} ({option.code})
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage {...messages.branchLabel} />}
                      error={touched.branchId && Boolean(errors.branchId)}
                      helperText={touched.branchId && errors.branchId}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete<Area, false>
                  size="small"
                  options={filteredAreas}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedArea}
                  onChange={(_, newValue) => setFieldValue('areaId', newValue?.id || '')}
                  disabled={!values.branchId}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id} className="font-urdu">
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage {...messages.areaLabel} />}
                      error={touched.areaId && Boolean(errors.areaId)}
                      helperText={touched.areaId && errors.areaId}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Student Information Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              <FormattedMessage {...messages.studentInfoSection} />
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="name"
                  fullWidth
                  size="small"
                  value={values.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  helperText={touched.name && errors.name}
                  error={touched.name && Boolean(errors.name)}
                  placeholder={formattedMessages.namePlaceholder}
                  label={<FormattedMessage {...messages.nameLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="fatherName"
                  fullWidth
                  size="small"
                  value={values.fatherName}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  helperText={touched.fatherName && errors.fatherName}
                  error={touched.fatherName && Boolean(errors.fatherName)}
                  placeholder={formattedMessages.fatherNamePlaceholder}
                  label={<FormattedMessage {...messages.fatherNameLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="phone"
                  fullWidth
                  size="small"
                  value={values.phone}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  helperText={touched.phone && errors.phone}
                  error={touched.phone && Boolean(errors.phone)}
                  placeholder={formattedMessages.phonePlaceholder}
                  label={<FormattedMessage {...messages.phoneLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="alternatePhone"
                  fullWidth
                  size="small"
                  value={values.alternatePhone}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={formattedMessages.alternatePhonePlaceholder}
                  label={<FormattedMessage {...messages.alternatePhoneLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="dateOfBirth"
                  fullWidth
                  size="small"
                  type="date"
                  value={values.dateOfBirth}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  helperText={touched.dateOfBirth && errors.dateOfBirth}
                  error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                  label={<FormattedMessage {...messages.dateOfBirthLabel} />}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="gender"
                  fullWidth
                  size="small"
                  select
                  value={values.gender}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  helperText={touched.gender && errors.gender}
                  error={touched.gender && Boolean(errors.gender)}
                  label={<FormattedMessage {...messages.genderLabel} />}
                >
                  <MenuItem value={CreateAdmissionDtoGender.MALE}>
                    <FormattedMessage {...messages.male} />
                  </MenuItem>
                  <MenuItem value={CreateAdmissionDtoGender.FEMALE}>
                    <FormattedMessage {...messages.female} />
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="address"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={values.address}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={formattedMessages.addressPlaceholder}
                  label={<FormattedMessage {...messages.addressLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="identityNumber"
                  fullWidth
                  size="small"
                  value={values.identityNumber}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={formattedMessages.identityNumberPlaceholder}
                  label={<FormattedMessage {...messages.identityNumberLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AssetUploader
                  category="admission"
                  type={AssetsControllerUploadPublicType.IMAGE}
                  label={formattedMessages.identityProofLabel}
                  helperText={formattedMessages.identityProofHelperText}
                  initialValue={values.identityProofAssetId ? { id: values.identityProofAssetId } : undefined}
                  onUploadSuccess={(asset) => setFieldValue('identityProofAssetId', asset.id)}
                  onDeleteSuccess={() => setFieldValue('identityProofAssetId', undefined)}
                  onError={() => {}}
                  height={120}
                  disabled={isSubmitting}
                />
              </Grid>
            </Grid>

            {/* Additional Information Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              <FormattedMessage {...messages.additionalInfoSection} />
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="schoolName"
                  fullWidth
                  size="small"
                  value={values.schoolName}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={formattedMessages.schoolNamePlaceholder}
                  label={<FormattedMessage {...messages.schoolNameLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="schoolClass"
                  fullWidth
                  size="small"
                  value={values.schoolClass}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={formattedMessages.schoolClassPlaceholder}
                  label={<FormattedMessage {...messages.schoolClassLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="lastYearClass"
                  fullWidth
                  size="small"
                  value={values.lastYearClass}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={formattedMessages.lastYearClassPlaceholder}
                  label={<FormattedMessage {...messages.lastYearClassLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="vanRequired"
                      checked={values.vanRequired}
                      onChange={(e) => setFieldValue('vanRequired', e.target.checked)}
                    />
                  }
                  label={<FormattedMessage {...messages.vanRequiredLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isMarried"
                      checked={values.isMarried}
                      onChange={(e) => setFieldValue('isMarried', e.target.checked)}
                    />
                  }
                  label={<FormattedMessage {...messages.isMarriedLabel} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isWorking"
                      checked={values.isWorking}
                      onChange={(e) => setFieldValue('isWorking', e.target.checked)}
                    />
                  }
                  label={<FormattedMessage {...messages.isWorkingLabel} />}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
          >
            {isSubmitting ? <FormattedMessage {...messages.creating} /> : <FormattedMessage {...messages.create} />}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
