'use client';

import React from 'react';

import { useFormik } from 'formik';
import { signOut } from 'next-auth/react';

import { Button, Stack, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';

import { useAdminAuthPasswordControllerCreatePassword } from '@/providers/service/admin-auth-password/admin-auth-password';

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
  captchaToken: string;
  captchaResetKey: number;
}

export function CreatePasswordForm(): React.JSX.Element {
  const { show } = useSnackbarContext();

  const createPassword = useAdminAuthPasswordControllerCreatePassword();

  const captchaSiteKey = React.useMemo(() => config.TURNSTILE_SITE_KEY || '', []);
  const captchaBypass = React.useMemo(() => config.CAPTCHA_BYPASS === 'true', []);
  const isCaptchaEnabled = !!captchaSiteKey && !captchaBypass;

  const formatMessage = {
    newPassword: useFormattedMessage(messages.newPassword),
    newPasswordPlaceholder: useFormattedMessage(messages.newPasswordPlaceholder),
    passwordRequired: useFormattedMessage(messages.passwordRequired),
    captchaRequired: useFormattedMessage(messages.captchaRequired),
    captchaResetKeyRequired: useFormattedMessage(messages.captchaResetKeyRequired),
  };

  const formik = useFormik<Values>({
    initialValues: { newPassword: '', captchaToken: '', captchaResetKey: 1 },
    validationSchema: validationSchema({ validationMessages: formatMessage, isCaptchaEnabled }),
    onSubmit: async (values, { setFieldValue, setFieldTouched }) => {
      createPassword
        .mutateAsync(
          {
            data: {
              newPassword: values.newPassword,
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
                message: extractNetworkError(error) || 'Failed to create password',
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

  const { handleSubmit, errors, values, setFieldValue, setFieldTouched, handleChange, handleBlur, touched } = formik;

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
          <FormattedMessage {...messages.createHeading} />
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <FormControl error={Boolean(errors.newPassword)}>
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
          </FormControl>

          {isCaptchaEnabled && (
            <Captcha onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} resetKey={values.captchaResetKey} />
          )}
          <Button
            type="submit"
            variant="contained"
            loading={createPassword.isPending}
            disabled={Object.keys(errors).length > 0}
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
