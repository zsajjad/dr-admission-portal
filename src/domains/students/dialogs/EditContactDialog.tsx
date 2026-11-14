'use client';

import { useFormik } from 'formik';

import { Grid, TextField } from '@mui/material';

import { StudentProfileIdentity, UpdateStudentDto } from '@/providers/service/app.schemas';
import { useStudentsControllerUpdate } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';

import { ProfileDialog } from './ProfileDialog';
import { useValidationMessages } from './useValidationMessages';
import { getContactSchema } from './validation';

interface EditContactDialogProps {
  open: boolean;
  student: StudentProfileIdentity;
  onClose: () => void;
}

export function EditContactDialog({ open, student, onClose }: EditContactDialogProps) {
  const validation = useValidationMessages();
  const { onSuccess, onError } = useProfileActions(student.id);
  const { show } = useSnackbarContext();
  const nothingChanged = useFormattedMessage(messages.nothingChanged);
  const mutation = useStudentsControllerUpdate();

  const initialValues = {
    phone: student.phone,
    alternatePhone: student.alternatePhone ?? '',
    address: student.address ?? '',
    reason: '',
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: getContactSchema(validation),
    onSubmit: (values) => {
      const data: UpdateStudentDto = {};
      if (values.phone.trim() !== initialValues.phone) data.phone = values.phone.trim();
      if (values.alternatePhone.trim() !== initialValues.alternatePhone) {
        data.alternatePhone = values.alternatePhone.trim();
      }
      if (values.address.trim() !== initialValues.address) data.address = values.address.trim();
      if (!Object.keys(data).length) {
        show({ message: nothingChanged, type: 'info' });
        return;
      }
      if (values.reason.trim()) data.reason = values.reason.trim();

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
      title={<FormattedMessage {...messages.contactDialogTitle} />}
      onClose={() => {
        formik.resetForm();
        onClose();
      }}
      onSubmit={formik.submitForm}
      isSubmitting={mutation.isPending}
    >
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            {...fieldProps('phone')}
            label={<FormattedMessage {...messages.phone} />}
            slotProps={{ htmlInput: { dir: 'ltr', inputMode: 'tel' } }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            {...fieldProps('alternatePhone')}
            label={<FormattedMessage {...messages.alternatePhone} />}
            slotProps={{ htmlInput: { dir: 'ltr', inputMode: 'tel' } }}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            {...fieldProps('address')}
            multiline
            minRows={2}
            label={<FormattedMessage {...messages.address} />}
          />
        </Grid>
        <Grid size={12}>
          <TextField {...fieldProps('reason')} label={<FormattedMessage {...messages.reasonOptional} />} />
        </Grid>
      </Grid>
    </ProfileDialog>
  );
}
