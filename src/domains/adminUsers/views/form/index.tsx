import { useFormik } from 'formik';

import { useRouter } from 'next/navigation';

import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';

import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { SubmitButton } from '@/components/SubmitButton';

import {
  useAdminUsersControllerCreate,
  useAdminUsersControllerUpdate,
} from '@/providers/service/admin-users/admin-users';
import { AdminUser } from '@/providers/service/app.schemas';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';

import messages from './messages';
import { getAdminUserValidationSchema } from './validationSchema';

interface AdminUserFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  editItem?: AdminUser;
  isLoading?: boolean;
}

export interface FormValues {
  name: string;
  email: string;
}

export default function AdminUserForm(props: AdminUserFormProps): React.JSX.Element {
  const { editItem } = props;
  const router = useRouter();

  const adminUserAddMutation = useAdminUsersControllerCreate();
  const adminUserUpdateMutation = useAdminUsersControllerUpdate();

  const validationMessages = {
    nameRequired: useFormattedMessage(messages.nameRequired),
    nameMin: useFormattedMessage(messages.nameMin),
    nameMax: useFormattedMessage(messages.nameMax),
    emailRequired: useFormattedMessage(messages.emailRequired),
    emailInvalid: useFormattedMessage(messages.emailInvalid),
  };
  const generalMessages = {
    saveSuccess: useFormattedMessage(messages.saveSuccess),
    saveError: useFormattedMessage(messages.saveError),
  };

  const initialValues: FormValues = {
    name: editItem?.name || '',
    email: editItem?.email || '',
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: getAdminUserValidationSchema({ validationMessages }),
    enableReinitialize: true,
    onSubmit: (values, { setStatus }) => {
      setStatus(null);

      const mutationData = {
        data: {
          name: values.name,
          email: values.email,
        },
      };

      if (editItem) {
        adminUserUpdateMutation.mutate(
          {
            id: editItem.id,
            ...mutationData,
          },
          {
            onSuccess,
            onError,
            onSettled: () => {},
          },
        );
      } else {
        adminUserAddMutation.mutate(mutationData, { onSuccess, onError });
      }
    },
  });

  const { onSuccess, onError } = useMutationHandlers({
    messages: {
      successUpdate: generalMessages.saveSuccess,
      errorUpdate: generalMessages.saveError,
    },
    setSubmitting: formik?.setSubmitting,
    setStatus: formik.setStatus,
    redirectTo: routes.adminUsers.listing,
  });

  const handleBack = () => {
    if (props.onClose) {
      props.onClose?.();
    } else {
      // Default behavior for full page
      router.push('/admin-users');
    }
  };
  const { values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, status } = formik;

  if (props?.isLoading) return <FormSkeleton />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {editItem ? <FormattedMessage {...messages.edit} /> : <FormattedMessage {...messages.add} />}
        </Typography>
        <IconButton onClick={handleBack} size="small">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {status && typeof status === 'string' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {status}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={3} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            name="name"
            variant="outlined"
            value={values.name}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.name && errors.name}
            label={<FormattedMessage {...messages.name} />}
            error={touched.name && Boolean(errors.name)}
            disabled={adminUserAddMutation.isPending || adminUserUpdateMutation.isPending || isSubmitting}
          />
          <TextField
            fullWidth
            name="email"
            type="email"
            variant="outlined"
            onBlur={handleBlur}
            value={values.email}
            onChange={handleChange}
            helperText={touched.email && errors.email}
            label={<FormattedMessage {...messages.email} />}
            error={touched.email && Boolean(errors.email)}
            disabled={adminUserAddMutation.isPending || adminUserUpdateMutation.isPending || isSubmitting}
          />
        </Stack>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleBack} disabled={isSubmitting}>
            <FormattedMessage {...messages.cancel} />
          </Button>
          <SubmitButton
            isSubmitting={isSubmitting}
            isEdit={!!editItem}
            messages={{
              create: messages.save,
              update: messages.update,
              saving: messages.saving,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
