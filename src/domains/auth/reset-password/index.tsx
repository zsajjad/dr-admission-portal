'use client';

import React, { useMemo } from 'react';

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { useFormik } from 'formik';
import { signOut } from 'next-auth/react';

import RouterLink from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Alert, Button, Stack, Typography } from '@mui/material';

import { useAdminAuthPasswordControllerResetPassword } from '@/providers/service/admin-auth-password/admin-auth-password';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { config } from '@/config';
import { removeAuthenticationHeader } from '@/services';

import { Captcha } from '../Captcha';
import { PasswordField } from '../Components/PasswordField';

import messages from './messages';
import { validationSchema } from './validationSchema';

interface Values {
  newPassword: string;
  confirmPassword: string;
  captchaToken: string;
  captchaResetKey: number;
}

const defaultValues: Values = { newPassword: '', confirmPassword: '', captchaToken: '', captchaResetKey: 1 };

export function ResetPasswordForm(): React.JSX.Element {
  const { show } = useSnackbarContext();

  const captchaSiteKey = React.useMemo(() => config.TURNSTILE_SITE_KEY || '', []);
  const captchaBypass = React.useMemo(() => config.CAPTCHA_BYPASS === 'true', []);
  const isCaptchaEnabled = !!captchaSiteKey && !captchaBypass;

  const formatMessage = {
    // Label
    newPassword: useFormattedMessage(messages.newPassword),
    confirmPassword: useFormattedMessage(messages.confirmPassword),

    // Placeholder
    newPasswordPlaceholder: useFormattedMessage(messages.newPasswordPlaceholder),
    confirmPasswordPlaceholder: useFormattedMessage(messages.confirmPasswordPlaceholder),

    // Validation messages
    newPasswordRequired: useFormattedMessage(messages.newPasswordRequired),
    confirmPasswordRequired: useFormattedMessage(messages.confirmPasswordRequired),
    captchaRequired: useFormattedMessage(messages.captchaRequired),
    captchaResetKeyRequired: useFormattedMessage(messages.captchaResetKeyRequired),
  };

  const formik = useFormik<Values>({
    initialValues: defaultValues,
    validationSchema: validationSchema({ validationMessages: formatMessage, isCaptchaEnabled }),
    onSubmit: async (values, { setFieldValue, setFieldTouched }) => {
      if (token) {
        resetPassword.mutateAsync(
          {
            data: {
              token,
              newPassword: values.newPassword,
              captchaToken: values.captchaToken,
            },
          },
          {
            onSuccess: async (success) => {
              show({
                type: 'success',
                message: success.message,
              });
              removeAuthenticationHeader();
              sessionStorage.removeItem('isTabActive');
              await signOut({ redirect: true, callbackUrl: routes.auth.signIn });
            },
            onError: (error) => {
              show({
                type: 'error',
                message: extractNetworkError(error) || 'Failed to Reset password',
              });
            },
          },
        );
        // reset captcha after each attempt
        setFieldValue('captchaToken', '', false);
        setFieldTouched('captchaToken', true);
        // increment to trigger Captcha reset
        setFieldValue('captchaResetKey', (k: number) => k + 1);
      }
    },
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue, setFieldTouched } = formik;

  const searchParams = useSearchParams();

  const token = useMemo(() => {
    return searchParams.get('token');
  }, [searchParams]);

  const resetPassword = useAdminAuthPasswordControllerResetPassword();

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

  // removed legacy onSubmit handler from react-hook-form migration

  if (!token) {
    return (
      <>
        <Button
          LinkComponent={RouterLink}
          href={routes.auth.signIn}
          startIcon={<ArrowLeftIcon fontSize="small" />}
          color="inherit"
          variant="text"
        >
          <Typography color="inherit" variant="body1">
            <FormattedMessage {...messages.back} />
          </Typography>
        </Button>
        <Alert sx={{ mt: 2 }} severity="error">
          <Typography>
            <FormattedMessage {...messages.invalid} />
          </Typography>
        </Alert>
      </>
    );
  }
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h5">
          <FormattedMessage {...messages.resetHeading} />
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <PasswordField
            label={formatMessage.newPassword}
            name="newPassword"
            value={values.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.newPassword && Boolean(errors.newPassword)}
            helperText={touched.newPassword && errors.newPassword}
            placeholder={formatMessage.newPasswordPlaceholder}
          />
          <PasswordField
            label={formatMessage.confirmPassword}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
            helperText={touched.confirmPassword && errors.confirmPassword}
            placeholder={formatMessage.confirmPasswordPlaceholder}
          />
          {isCaptchaEnabled ? (
            <Captcha onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} resetKey={values.captchaResetKey} />
          ) : null}
          <Button type="submit" variant="contained" loading={resetPassword.isPending}>
            <FormattedMessage {...messages.continue} />
          </Button>
          {resetPassword.isError ? <Alert color="error">{extractNetworkError(resetPassword.error)}</Alert> : null}
        </Stack>
      </form>
    </Stack>
  );
}
