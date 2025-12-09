'use client';

import React from 'react';

import { useFormik } from 'formik';

import { Alert, Grid, Stack, TextField } from '@mui/material';

import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { SubmitButton } from '@/components/SubmitButton';

import { Branch } from '@/providers/service/app.schemas';
import { useBranchControllerCreate, useBranchControllerUpdate } from '@/providers/service/branch/branch';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';

import messages from './messages';
import { getBranchValidationSchema } from './validationSchema';

interface BranchFormProps {
  editItem?: Branch;
  isLoading?: boolean;
  isEditMode?: boolean;
}

interface FormValues {
  code: string;
  name: string;
}

export default function BranchForm({ editItem, isLoading, isEditMode = false }: BranchFormProps): React.JSX.Element {
  const branchCreate = useBranchControllerCreate();
  const branchUpdate = useBranchControllerUpdate();

  const validationMessages = {
    codeRequired: useFormattedMessage(messages.codeError),
    nameRequired: useFormattedMessage(messages.nameError),
  };

  const generalMessages = {
    saveError: useFormattedMessage(messages.saveError),
    saveSuccess: useFormattedMessage(messages.saveSuccess),
    failedToFetch: useFormattedMessage(messages.failedToFetch),
  };

  const initialValues: FormValues = {
    code: editItem?.code || '',
    name: editItem?.name || '',
  };

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: getBranchValidationSchema({ validationMessages }),
    onSubmit: (values, { setStatus }) => {
      setStatus(null);

      if (editItem) {
        branchUpdate.mutate(
          {
            id: editItem.id.toString(),
            data: {
              code: values.code,
              name: values.name,
            },
          },
          { onSuccess, onError },
        );
      } else {
        branchCreate.mutate(
          {
            data: {
              code: values.code,
              name: values.name,
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
    redirectTo: routes.branches.listing,
    setSubmitting: formik.setSubmitting,
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting } = formik;

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
