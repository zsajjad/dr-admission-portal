'use client';

import { useFormik } from 'formik';

import { Alert, Grid, TextField } from '@mui/material';

import { Gender, StudentProfileIdentity, UpdateStudentIdentityDto } from '@/providers/service/app.schemas';
import { useStudentsControllerUpdateIdentity } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';

import { ProfileDialog } from './ProfileDialog';
import { useValidationMessages } from './useValidationMessages';
import { getIdentitySchema } from './validation';

interface EditIdentityDialogProps {
  open: boolean;
  student: StudentProfileIdentity;
  onClose: () => void;
}

/** Name, father name, birth date, B-form and GR number. SUPER_ADMIN / ADMIN only; a reason is required. */
export function EditIdentityDialog({ open, student, onClose }: EditIdentityDialogProps) {
  const genderDigit = student.gender === Gender.FEMALE ? '0' : '1';
  const validation = useValidationMessages(genderDigit);
  const { onSuccess, onError } = useProfileActions(student.id);
  const { show } = useSnackbarContext();
  const nothingChanged = useFormattedMessage(messages.nothingChanged);
  const mutation = useStudentsControllerUpdateIdentity();

  const initialValues = {
    name: student.name,
    fatherName: student.fatherName,
    dateOfBirth: student.dateOfBirth.slice(0, 10),
    identityNumber: student.identityNumber ?? '',
    grNumber: student.grNumber,
    reason: '',
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: getIdentitySchema(validation, genderDigit),
    onSubmit: (values) => {
      const data: UpdateStudentIdentityDto = { reason: values.reason.trim() };
      if (values.name.trim() !== initialValues.name) data.name = values.name.trim();
      if (values.fatherName.trim() !== initialValues.fatherName) data.fatherName = values.fatherName.trim();
      if (values.dateOfBirth !== initialValues.dateOfBirth) data.dateOfBirth = values.dateOfBirth;
      if (values.identityNumber.trim() !== initialValues.identityNumber) {
        data.identityNumber = values.identityNumber.trim();
      }
      if (values.grNumber.trim() !== initialValues.grNumber) data.grNumber = values.grNumber.trim();

      if (Object.keys(data).length === 1) {
        show({ message: nothingChanged, type: 'info' });
        return;
      }

      mutation.mutate(
        { id: student.id, data },
        {
          onSuccess: async () => {
            await onSuccess();
            formik.resetForm();
            onClose();
          },
          onError,
        },
      );
    },
  });

  const fieldProps = (name: keyof typeof initialValues) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
    size: 'small' as const,
  });

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.identityDialogTitle} />}
      onClose={() => {
        formik.resetForm();
        onClose();
      }}
      onSubmit={formik.submitForm}
      isSubmitting={mutation.isPending}
    >
      <Alert severity="warning" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.identityDialogWarning} />
      </Alert>
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField {...fieldProps('name')} label={<FormattedMessage {...messages.name} />} />
        </Grid>
        <Grid size={6}>
          <TextField {...fieldProps('fatherName')} label={<FormattedMessage {...messages.fatherName} />} />
        </Grid>
        <Grid size={6}>
          <TextField
            {...fieldProps('dateOfBirth')}
            type="date"
            label={<FormattedMessage {...messages.dateOfBirth} />}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={
              (formik.touched.dateOfBirth && formik.errors.dateOfBirth) || (
                <FormattedMessage {...messages.identityDobNote} />
              )
            }
          />
        </Grid>
        <Grid size={6}>
          <TextField
            {...fieldProps('identityNumber')}
            label={<FormattedMessage {...messages.identityNumber} />}
            slotProps={{ htmlInput: { dir: 'ltr' } }}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            {...fieldProps('grNumber')}
            label={<FormattedMessage {...messages.grNumber} />}
            slotProps={{ htmlInput: { dir: 'ltr', style: { fontFamily: 'monospace' } } }}
            helperText={
              (formik.touched.grNumber && formik.errors.grNumber) || <FormattedMessage {...messages.grFormat} />
            }
          />
        </Grid>
        <Grid size={12}>
          <TextField
            {...fieldProps('reason')}
            required
            multiline
            minRows={2}
            label={<FormattedMessage {...messages.reason} />}
          />
        </Grid>
      </Grid>
    </ProfileDialog>
  );
}
