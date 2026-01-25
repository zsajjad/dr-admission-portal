'use client';

import React, { useMemo } from 'react';

import { useFormik } from 'formik';

import { Alert, Autocomplete, Box, Chip, Grid, Stack, TextField } from '@mui/material';

import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { SubmitButton } from '@/components/SubmitButton';

import { Area, Branch, Van } from '@/providers/service/app.schemas';
import { useAreaControllerFindAll } from '@/providers/service/area/area';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import { useVanControllerCreate, useVanControllerUpdate } from '@/providers/service/van/van';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';

import messages from './messages';
import { getVanValidationSchema } from './validationSchema';

interface VanFormProps {
  editItem?: Van;
  isLoading?: boolean;
  isEditMode?: boolean;
}

interface FormValues {
  branchId: string;
  code: string;
  name: string;
  colorName: string;
  colorHex: string;
  areaIds: string[];
}

export default function VanForm({ editItem, isLoading, isEditMode = false }: VanFormProps): React.JSX.Element {
  const vanCreate = useVanControllerCreate();
  const vanUpdate = useVanControllerUpdate();

  // Fetch branches for dropdown
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const branches = branchesData?.data || [];

  const validationMessages = {
    branchRequired: useFormattedMessage(messages.branchError),
    codeRequired: useFormattedMessage(messages.codeError),
    nameRequired: useFormattedMessage(messages.nameError),
    colorNameRequired: useFormattedMessage(messages.colorNameError),
    colorHexRequired: useFormattedMessage(messages.colorHexError),
    colorHexInvalid: useFormattedMessage(messages.colorHexInvalidError),
  };

  const generalMessages = {
    saveError: useFormattedMessage(messages.saveError),
    saveSuccess: useFormattedMessage(messages.saveSuccess),
    failedToFetch: useFormattedMessage(messages.failedToFetch),
  };

  const initialValues: FormValues = {
    branchId: editItem?.branch?.id || '',
    code: editItem?.code || '',
    name: editItem?.name || '',
    colorName: editItem?.colorName || '',
    colorHex: editItem?.colorHex || '#000000',
    areaIds: editItem?.areas?.map((a) => a.id) || [],
  };

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: getVanValidationSchema({ validationMessages }),
    onSubmit: (values, { setStatus }) => {
      setStatus(null);

      if (editItem) {
        vanUpdate.mutate(
          {
            id: editItem.id.toString(),
            data: {
              branchId: values.branchId,
              code: values.code,
              name: values.name,
              colorName: values.colorName,
              colorHex: values.colorHex,
              areaIds: values.areaIds,
            },
          },
          { onSuccess, onError },
        );
      } else {
        vanCreate.mutate(
          {
            data: {
              branchId: values.branchId,
              code: values.code,
              name: values.name,
              colorName: values.colorName,
              colorHex: values.colorHex,
              areaIds: values.areaIds,
            },
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
    setStatus: formik.setStatus,
    redirectTo: routes.van.listing,
    setSubmitting: formik.setSubmitting,
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue } = formik;

  // Fetch areas filtered by selected branch
  const { data: areasData } = useAreaControllerFindAll({
    take: 100,
    branchId: values.branchId || undefined,
  });
  const areas = areasData?.data || [];

  // Find selected values for controlled Autocomplete
  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === values.branchId) || null,
    [branches, values.branchId],
  );

  const selectedAreas = useMemo(() => areas.filter((a) => values.areaIds.includes(a.id)), [areas, values.areaIds]);

  useEntityDetailHandler({
    data: editItem,
    isLoading: isLoading ?? false,
    notFoundMessage: generalMessages.failedToFetch,
    isEnabled: isEditMode,
  });

  if (isLoading) return <FormSkeleton />;

  return (
    <Stack component="form" onSubmit={handleSubmit} sx={{ paddingBlockEnd: 2 }} spacing={2}>
      {formik.status && typeof formik.status === 'string' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formik.status}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete<Branch, false>
            options={branches}
            getOptionLabel={(option) => option.name || ''}
            value={selectedBranch}
            onChange={(_, newValue) => {
              setFieldValue('branchId', newValue?.id || '');
              // Clear areas when branch changes
              setFieldValue('areaIds', []);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={<FormattedMessage {...messages.branchLabel} />}
                placeholder={messages.branchPlaceholder.defaultMessage}
                error={touched.branchId && Boolean(errors.branchId)}
                helperText={touched.branchId && errors.branchId}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="code"
            label={<FormattedMessage {...messages.codeLabel} />}
            placeholder={messages.codePlaceholder.defaultMessage}
            value={values.code}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.code && Boolean(errors.code)}
            helperText={touched.code && errors.code}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="name"
            label={<FormattedMessage {...messages.nameLabel} />}
            placeholder={messages.namePlaceholder.defaultMessage}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="colorName"
            label={<FormattedMessage {...messages.colorNameLabel} />}
            placeholder={messages.colorNamePlaceholder.defaultMessage}
            value={values.colorName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.colorName && Boolean(errors.colorName)}
            helperText={touched.colorName && errors.colorName}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              component="input"
              type="color"
              value={values.colorHex}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('colorHex', e.target.value)}
              sx={{
                width: 56,
                height: 56,
                padding: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                '&::-webkit-color-swatch-wrapper': { padding: 0 },
                '&::-webkit-color-swatch': { border: 'none', borderRadius: 1 },
              }}
            />
            <TextField
              fullWidth
              name="colorHex"
              label={<FormattedMessage {...messages.colorHexLabel} />}
              placeholder={messages.colorHexPlaceholder.defaultMessage}
              value={values.colorHex}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.colorHex && Boolean(errors.colorHex)}
              helperText={touched.colorHex && errors.colorHex}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Autocomplete<Area, true>
            multiple
            options={areas}
            getOptionLabel={(option) => option.name || ''}
            value={selectedAreas}
            onChange={(_, newValue) => {
              setFieldValue(
                'areaIds',
                newValue.map((a) => a.id),
              );
            }}
            disabled={!values.branchId}
            renderInput={(params) => (
              <TextField
                {...params}
                label={<FormattedMessage {...messages.areasLabel} />}
                placeholder={values.branchId ? messages.areasPlaceholder.defaultMessage : 'Select a branch first'}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip key={key} label={option.name} {...tagProps} />;
              })
            }
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
