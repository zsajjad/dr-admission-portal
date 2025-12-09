'use client';

import React, { useMemo } from 'react';

import { useFormik } from 'formik';
import { signOut } from 'next-auth/react';

import RouterLink from 'next/link';

import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { Logo } from '@/components/Logo';

import { useAdminAuthPasswordControllerChangePassword } from '@/providers/service/admin-auth-password/admin-auth-password';

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
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  captchaToken: string;
  captchaResetKey: number;
}

const defaultValues: Values = {
  newPassword: '',
  currentPassword: '',
  confirmPassword: '',
  captchaToken: '',
  captchaResetKey: 1,
};

export function ChangePasswordForm(): React.JSX.Element {
  const captchaSiteKey = useMemo(() => config.TURNSTILE_SITE_KEY || '', []);
  const captchaBypass = useMemo(() => config.CAPTCHA_BYPASS === 'true', []);
  const isCaptchaEnabled = !!captchaSiteKey && !captchaBypass;

  const formatMessage = {
    currentPasswordRequired: useFormattedMessage(messages.currentPasswordRequired),
    newPasswordRequired: useFormattedMessage(messages.newPasswordRequired),
    passwordMinCharacters: useFormattedMessage(messages.passwordMinCharacters),
    passwordUppercase: useFormattedMessage(messages.passwordUppercase),
    passwordNumber: useFormattedMessage(messages.passwordNumber),
    passwordSpecialCharacter: useFormattedMessage(messages.passwordSpecialCharacter),
    passwordNotSame: useFormattedMessage(messages.passwordNotSame),
    confirmPasswordRequired: useFormattedMessage(messages.confirmPasswordRequired),
    passwordNotMatch: useFormattedMessage(messages.passwordNotMatch),
    captchaRequired: useFormattedMessage(messages.captchaRequired),
    captchaResetKeyRequired: useFormattedMessage(messages.captchaResetKeyRequired),
    newPassword: useFormattedMessage(messages.newPassword),
    confirmPassword: useFormattedMessage(messages.confirmPassword),
    currentPassword: useFormattedMessage(messages.currentPassword),

    // Placeholders
    currentPasswordPlaceholder: useFormattedMessage(messages.currentPasswordPlaceholder),
    newPasswordPlaceholder: useFormattedMessage(messages.newPasswordPlaceholder),
    confirmPasswordPlaceholder: useFormattedMessage(messages.confirmPasswordPlaceholder),
  };

  const { show } = useSnackbarContext();
  const changePassword = useAdminAuthPasswordControllerChangePassword();

  const formik = useFormik<Values>({
    initialValues: defaultValues,
    validationSchema: validationSchema({ validationMessages: formatMessage, isCaptchaEnabled }),
    onSubmit: async (values, { setStatus, setFieldValue, setFieldTouched }) => {
      setStatus(null);
      changePassword
        .mutateAsync(
          { data: { currentPassword: values.currentPassword, newPassword: values.newPassword } },
          {
            onSuccess: async (success) => {
              show({ type: 'success', message: success.message });
              removeAuthenticationHeader();
              sessionStorage.removeItem('isTabActive');
              await signOut({ redirect: true, callbackUrl: routes.auth.signIn });
            },
            onError: (error) => {
              const message = extractNetworkError(error) || 'Failed to Change password';
              show({ type: 'error', message });
              setStatus(message);
            },
          },
        )
        .finally(() => {
          // reset captcha after each attempt
          setFieldValue('captchaToken', '', false);
          setFieldTouched('captchaToken', true);
          setFieldValue('captchaResetKey', values.captchaResetKey + 1);
        });
    },
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, status, setFieldValue, setFieldTouched } =
    formik;

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
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={2}
    >
      <Card sx={{ maxWidth: 800, width: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Box
              component={RouterLink}
              href={routes.home}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              gap={2}
            >
              <Logo width={'200px'} />
            </Box>
            <Typography variant="h5" textAlign="center">
              <FormattedMessage {...messages.changeHeading} />
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <PasswordField
                  label={formatMessage.currentPassword}
                  name="currentPassword"
                  value={values.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.currentPassword && Boolean(errors.currentPassword)}
                  helperText={touched.currentPassword && errors.currentPassword}
                  placeholder={formatMessage.currentPasswordPlaceholder}
                />
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

                {isCaptchaEnabled && (
                  <Captcha
                    onVerify={handleCaptchaVerify}
                    onExpire={handleCaptchaExpire}
                    resetKey={values.captchaResetKey}
                  />
                )}

                {status ? (
                  <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
                    {status.replace(/,/g, '\n')}
                  </Alert>
                ) : null}
                <Button
                  type="submit"
                  variant="contained"
                  loading={changePassword.isPending}
                  fullWidth
                  disabled={Object.keys(errors).length > 0}
                >
                  <FormattedMessage {...messages.submit} />
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
