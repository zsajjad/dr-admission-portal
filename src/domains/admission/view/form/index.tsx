'use client';

import React from 'react';

import { format } from 'date-fns';
import { useFormik } from 'formik';

import { Alert, Checkbox, FormControlLabel, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { SubmitButton } from '@/components/SubmitButton';

import { useAdmissionsControllerUpdate } from '@/providers/service/admissions/admissions';
import { Admission, UpdateAdmissionDtoGender } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';

import messages from './messages';
import { getAdmissionValidationSchema } from './validationSchema';

interface AdmissionFormProps {
  editItem?: Admission;
  isLoading?: boolean;
  isEditMode?: boolean;
}

interface FormValues {
  name: string;
  fatherName: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: UpdateAdmissionDtoGender;
  address?: string;
  identityNumber?: string;
  branchId: string;
  areaId: string;
  schoolName?: string;
  schoolClass?: string;
  lastYearClass?: string;
  vanRequired: boolean;
  isMarried: boolean;
  isWorking: boolean;
}

export function AdmissionForm({ editItem, isLoading, isEditMode = false }: AdmissionFormProps): React.JSX.Element {
  const admissionUpdateMutation = useAdmissionsControllerUpdate();

  const validationMessages = {
    nameRequiredError: useFormattedMessage(messages.nameRequiredError),
    fatherNameRequiredError: useFormattedMessage(messages.fatherNameRequiredError),
    phoneRequiredError: useFormattedMessage(messages.phoneRequiredError),
    dateOfBirthRequiredError: useFormattedMessage(messages.dateOfBirthRequiredError),
    genderRequiredError: useFormattedMessage(messages.genderRequiredError),
    branchRequiredError: useFormattedMessage(messages.branchRequiredError),
    areaRequiredError: useFormattedMessage(messages.areaRequiredError),
    sessionRequiredError: useFormattedMessage(messages.sessionRequiredError),
  };

  const generalMessages = {
    saveSuccess: useFormattedMessage(messages.saveSuccess),
    saveError: useFormattedMessage(messages.saveError),
    failedToFetch: useFormattedMessage(messages.failedToFetch),

    //placeholder
    namePlaceholder: useFormattedMessage(messages.namePlaceholder),
    fatherNamePlaceholder: useFormattedMessage(messages.fatherNamePlaceholder),
    phonePlaceholder: useFormattedMessage(messages.phonePlaceholder),
    alternatePhonePlaceholder: useFormattedMessage(messages.alternatePhonePlaceholder),
    dateOfBirthPlaceholder: useFormattedMessage(messages.dateOfBirthPlaceholder),
    genderPlaceholder: useFormattedMessage(messages.genderPlaceholder),
    addressPlaceholder: useFormattedMessage(messages.addressPlaceholder),
    identityNumberPlaceholder: useFormattedMessage(messages.identityNumberPlaceholder),
    branchPlaceholder: useFormattedMessage(messages.branchPlaceholder),
    areaPlaceholder: useFormattedMessage(messages.areaPlaceholder),
    sessionPlaceholder: useFormattedMessage(messages.sessionPlaceholder),
    schoolNamePlaceholder: useFormattedMessage(messages.schoolNamePlaceholder),
    schoolClassPlaceholder: useFormattedMessage(messages.schoolClassPlaceholder),
    lastYearClassPlaceholder: useFormattedMessage(messages.lastYearClassPlaceholder),
  };

  const initialValues: FormValues = {
    name: editItem?.student?.name || '',
    fatherName: editItem?.student?.fatherName || '',
    phone: editItem?.student?.phone || '',
    alternatePhone: editItem?.student?.alternatePhone || '',
    dateOfBirth: editItem?.student?.dateOfBirth ? format(new Date(editItem.student.dateOfBirth), 'yyyy-MM-dd') : '',
    gender: (editItem?.student?.gender as UpdateAdmissionDtoGender) || UpdateAdmissionDtoGender.MALE,
    address: editItem?.student?.address || '',
    identityNumber: editItem?.student?.identityNumber || '',
    branchId: editItem?.branch?.id || '',
    areaId: editItem?.area?.id || '',
    schoolName: editItem?.schoolName || '',
    schoolClass: editItem?.schoolClass || '',
    lastYearClass: editItem?.lastYearClass || '',
    vanRequired: editItem?.vanRequired || false,
    isMarried: editItem?.isMarried || false,
    isWorking: editItem?.isWorking || false,
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: getAdmissionValidationSchema({ validationMessages }),
    enableReinitialize: true,
    onSubmit: (values, { setStatus }) => {
      setStatus(null);

      if (editItem) {
        const editMutationData = {
          data: {
            name: values.name,
            fatherName: values.fatherName,
            phone: values.phone,
            alternatePhone: values.alternatePhone,
            dateOfBirth: values.dateOfBirth,
            gender: values.gender,
            address: values.address,
            identityNumber: values.identityNumber,
            branchId: values.branchId,
            areaId: values.areaId,
            schoolName: values.schoolName,
            schoolClass: values.schoolClass,
            lastYearClass: values.lastYearClass,
            vanRequired: values.vanRequired,
            isMarried: values.isMarried,
            isWorking: values.isWorking,
          },
        };
        admissionUpdateMutation.mutate(
          {
            id: editItem?.id.toString(),
            ...editMutationData,
          },
          { onSuccess, onError },
        );
      }
    },
  });

  const { onSuccess, onError } = useMutationHandlers({
    messages: {
      successUpdate: generalMessages.saveSuccess,
      errorUpdate: generalMessages.saveError,
    },
    setSubmitting: formik.setSubmitting,
    setStatus: formik.setStatus,
    redirectTo: routes.admission.listing,
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue } = formik;

  useEntityDetailHandler({
    data: editItem,
    isLoading: isLoading ?? false,
    notFoundMessage: generalMessages.failedToFetch,
    isEnabled: isEditMode,
    redirectTo: routes.admission.listing,
  });

  if (isLoading) return <FormSkeleton />;

  return (
    <Stack component="form" onSubmit={handleSubmit} sx={{ paddingBlockEnd: 2 }} spacing={2}>
      {formik.status && typeof formik.status === 'string' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formik.status}
        </Alert>
      )}

      {/* Student Information Section */}
      <Typography variant="h6">
        <FormattedMessage {...messages.studentInfoSection} />
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="name"
            fullWidth
            value={values.name}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.name && errors.name}
            error={touched.name && Boolean(errors.name)}
            placeholder={generalMessages.namePlaceholder}
            label={<FormattedMessage {...messages.nameLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="fatherName"
            fullWidth
            value={values.fatherName}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.fatherName && errors.fatherName}
            error={touched.fatherName && Boolean(errors.fatherName)}
            placeholder={generalMessages.fatherNamePlaceholder}
            label={<FormattedMessage {...messages.fatherNameLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="phone"
            fullWidth
            value={values.phone}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.phone && errors.phone}
            error={touched.phone && Boolean(errors.phone)}
            placeholder={generalMessages.phonePlaceholder}
            label={<FormattedMessage {...messages.phoneLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="alternatePhone"
            fullWidth
            value={values.alternatePhone}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.alternatePhone && errors.alternatePhone}
            error={touched.alternatePhone && Boolean(errors.alternatePhone)}
            placeholder={generalMessages.alternatePhonePlaceholder}
            label={<FormattedMessage {...messages.alternatePhoneLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="dateOfBirth"
            fullWidth
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
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="gender"
            fullWidth
            select
            value={values.gender}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.gender && errors.gender}
            error={touched.gender && Boolean(errors.gender)}
            label={<FormattedMessage {...messages.genderLabel} />}
          >
            <MenuItem value={UpdateAdmissionDtoGender.MALE}>
              <FormattedMessage {...messages.male} />
            </MenuItem>
            <MenuItem value={UpdateAdmissionDtoGender.FEMALE}>
              <FormattedMessage {...messages.female} />
            </MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            name="address"
            fullWidth
            multiline
            rows={2}
            value={values.address}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.address && errors.address}
            error={touched.address && Boolean(errors.address)}
            placeholder={generalMessages.addressPlaceholder}
            label={<FormattedMessage {...messages.addressLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="identityNumber"
            fullWidth
            value={values.identityNumber}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.identityNumber && errors.identityNumber}
            error={touched.identityNumber && Boolean(errors.identityNumber)}
            placeholder={generalMessages.identityNumberPlaceholder}
            label={<FormattedMessage {...messages.identityNumberLabel} />}
          />
        </Grid>
      </Grid>

      {/* Admission Information Section */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        <FormattedMessage {...messages.admissionInfoSection} />
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="branchId"
            fullWidth
            value={values.branchId}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.branchId && errors.branchId}
            error={touched.branchId && Boolean(errors.branchId)}
            placeholder={generalMessages.branchPlaceholder}
            label={<FormattedMessage {...messages.branchLabel} />}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
          <TextField
            name="areaId"
            fullWidth
            value={values.areaId}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.areaId && errors.areaId}
            error={touched.areaId && Boolean(errors.areaId)}
            placeholder={generalMessages.areaPlaceholder}
            label={<FormattedMessage {...messages.areaLabel} />}
            disabled
          />
        </Grid>
      </Grid>

      {/* Additional Information Section */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        <FormattedMessage {...messages.additionalInfoSection} />
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField
            name="schoolName"
            fullWidth
            value={values.schoolName}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.schoolName && errors.schoolName}
            error={touched.schoolName && Boolean(errors.schoolName)}
            placeholder={generalMessages.schoolNamePlaceholder}
            label={<FormattedMessage {...messages.schoolNameLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField
            name="schoolClass"
            fullWidth
            value={values.schoolClass}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.schoolClass && errors.schoolClass}
            error={touched.schoolClass && Boolean(errors.schoolClass)}
            placeholder={generalMessages.schoolClassPlaceholder}
            label={<FormattedMessage {...messages.schoolClassLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField
            name="lastYearClass"
            fullWidth
            value={values.lastYearClass}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.lastYearClass && errors.lastYearClass}
            error={touched.lastYearClass && Boolean(errors.lastYearClass)}
            placeholder={generalMessages.lastYearClassPlaceholder}
            label={<FormattedMessage {...messages.lastYearClassLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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

      <SubmitButton
        isSubmitting={isSubmitting}
        disabled={!formik.dirty}
        isEdit={!!editItem}
        messages={{
          create: messages.create,
          update: messages.update,
          saving: messages.saving,
        }}
      />
    </Stack>
  );
}
