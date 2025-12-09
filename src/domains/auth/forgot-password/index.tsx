'use client';

import React from 'react';

import { useFormik } from 'formik';

import RouterLink from 'next/link';

import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

import { useAdminAuthPasswordControllerForgotPassword } from '@/providers/service/admin-auth-password/admin-auth-password';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { config } from '@/config';

import { Captcha } from '../Captcha';

import messages from './messages';
import { validationSchema } from './validationSchema';

interface Values {
  email: string;
  captchaToken: string;
  captchaResetKey: number;
}

const defaultValues: Values = { email: '', captchaToken: '', captchaResetKey: 1 };

export function ForgotPasswordForm(): React.JSX.Element {
  const { show } = useSnackbarContext();
  const forgotPassword = useAdminAuthPasswordControllerForgotPassword();

  const captchaSiteKey = React.useMemo(() => config.TURNSTILE_SITE_KEY || '', []);
  const captchaBypass = React.useMemo(() => config.CAPTCHA_BYPASS === 'true', []);
  const isCaptchaEnabled = !!captchaSiteKey && !captchaBypass;

  const formatMessage = {
    invalidEmail: useFormattedMessage(messages.invalidEmail),
    emailRequired: useFormattedMessage(messages.emailRequired),
    captchaRequired: useFormattedMessage(messages.captchaRequired),
    captchaResetKeyRequired: useFormattedMessage(messages.captchaResetKeyRequired),
    emailPlaceholder: useFormattedMessage(messages.emailPlaceholder),
  };

  const formik = useFormik<Values>({
    initialValues: defaultValues,
    validationSchema: validationSchema({ validationMessages: formatMessage, isCaptchaEnabled }),
    onSubmit: async (values, { setFieldValue, setFieldTouched }) => {
      forgotPassword
        .mutateAsync(
          {
            data: {
              email: values.email,
              captchaToken: values.captchaToken,
            },
          },
          {
            onSuccess: (success) => {
              show({
                type: 'success',
                message: success.message,
              });
            },
            onError: (error) => {
              show({
                type: 'error',
                message: extractNetworkError(error) || 'Failed to reset password',
              });
            },
          },
        )
        .finally(() => {
          // reset captcha after each attempt
          setFieldValue('captchaToken', '', false);
          setFieldTouched('captchaToken', true);
          // increment to trigger Captcha reset
          setFieldValue('captchaResetKey', (k: number) => k + 1);
        });
    },
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue, setFieldTouched } = formik;

  const handleCaptchaVerify = React.useCallback(
    (token: string) => {
      setFieldValue('captchaToken', token);
    },
    [setFieldValue],
  );

  const handleCaptchaExpire = React.useCallback(() => {
    setFieldValue('captchaToken', '');
    setFieldTouched('captchaToken', true);
  }, [setFieldTouched, setFieldValue]);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h5">
          <FormattedMessage {...messages.forgotHeading} />
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            name="email"
            type="email"
            variant="outlined"
            value={values.email}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.email && errors.email}
            label={<FormattedMessage {...messages.email} />}
            error={touched.email && Boolean(errors.email)}
            placeholder={formatMessage.emailPlaceholder}
          />
          {isCaptchaEnabled && (
            <Captcha onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} resetKey={values.captchaResetKey} />
          )}
          {forgotPassword.isError ? <Alert color="error">{extractNetworkError(forgotPassword.error)}</Alert> : null}
          {forgotPassword.isSuccess ? <Alert color="success">{forgotPassword.data?.message}</Alert> : null}
          <Button
            type="submit"
            variant="contained"
            loading={forgotPassword.isPending}
            disabled={Object.keys(errors).length > 0}
          >
            <FormattedMessage {...messages.resetPassword} />
          </Button>
          <Button LinkComponent={RouterLink} href={routes.auth.signIn} color="inherit" variant="text">
            <Typography color="textSecondary" variant="body1">
              <FormattedMessage {...messages.back} />
            </Typography>
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
