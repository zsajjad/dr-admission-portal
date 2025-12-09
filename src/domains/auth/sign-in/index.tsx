'use client';

import * as React from 'react';
import { JSX, useMemo, useCallback } from 'react';

import { useFormik } from 'formik';

import RouterLink from 'next/link';

import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useAuthContext } from '@/contexts/AuthContext';

import { routes } from '@/router/routes';

import { config } from '@/config';

import { Captcha } from '../Captcha';
import { PasswordField } from '../Components/PasswordField';

import messages from './messages';
import { validationSchema } from './validationSchema';

interface Values {
  username: string;
  password: string;
  captchaToken: string;
  captchaResetKey: number;
}

const defaultValues: Values = { username: '', password: '', captchaToken: '', captchaResetKey: 1 };

export function SignInForm(): JSX.Element {
  const { signIn, loading } = useAuthContext();

  const captchaSiteKey = useMemo(() => config.TURNSTILE_SITE_KEY || '', []);
  const captchaBypass = useMemo(() => config.CAPTCHA_BYPASS === 'true', []);
  const isCaptchaEnabled = !!captchaSiteKey && !captchaBypass;

  // Localized messages
  const validationMessages = {
    usernameRequired: useFormattedMessage(messages.usernameRequired),
    passwordRequired: useFormattedMessage(messages.passwordRequired),
    captchaRequired: useFormattedMessage(messages.captchaRequired),
    captchaResetKeyRequired: useFormattedMessage(messages.captchaResetKeyRequired),
  };

  const generalMessages = {
    signInHeading: useFormattedMessage(messages.signInHeading),
    username: useFormattedMessage(messages.username),
    password: useFormattedMessage(messages.password),
    forgotPasswordLink: useFormattedMessage(messages.forgotPasswordLink),
    usernamePlaceholder: useFormattedMessage(messages.usernamePlaceholder),
    passwordPlaceholder: useFormattedMessage(messages.passwordPlaceholder),
  };

  const formik = useFormik<Values>({
    initialValues: defaultValues,
    validationSchema: validationSchema({ validationMessages, isCaptchaEnabled }),
    onSubmit: async (values) => {
      await signIn({ email: values.username, password: values.password, captchaToken: values.captchaToken });
      // reset captcha after each attempt
      if (isCaptchaEnabled) {
        setFieldValue('captchaToken', '', false);
        setFieldTouched('captchaToken', true);
        setFieldValue('captchaResetKey', (values.captchaResetKey || 0) + 1);
      }
    },
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue, setFieldTouched } = formik;

  const handleCaptchaVerify = useCallback(
    (token: string) => {
      if (isCaptchaEnabled) {
        setFieldValue('captchaToken', token);
      }
    },
    [setFieldValue, isCaptchaEnabled],
  );

  const handleCaptchaExpire = useCallback(() => {
    if (isCaptchaEnabled) {
      setFieldValue('captchaToken', '');
      setFieldTouched('captchaToken', true);
      setFieldValue('captchaResetKey', (values.captchaResetKey || 0) + 1);
    }
  }, [isCaptchaEnabled, setFieldValue, setFieldTouched, values.captchaResetKey]);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h5">{generalMessages.signInHeading}</Typography>
        {/* <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={routes.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography> */}
      </Stack>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Stack spacing={2}>
          <TextField
            fullWidth
            name="username"
            variant="outlined"
            value={values.username}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.username && errors.username}
            label={generalMessages.username}
            error={touched.username && Boolean(errors.username)}
            disabled={loading}
            placeholder={generalMessages.usernamePlaceholder}
          />
          <PasswordField
            name="password"
            value={values.password}
            onBlur={handleBlur}
            onChange={handleChange}
            helperText={touched.password && errors.password}
            label={generalMessages.password}
            error={touched.password && Boolean(errors.password)}
            placeholder={generalMessages.passwordPlaceholder}
          />
          {isCaptchaEnabled && (
            <Captcha onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} resetKey={values.captchaResetKey} />
          )}
          <Box>
            <Link component={RouterLink} href={routes.auth.forgotPassword} variant="subtitle2">
              {generalMessages.forgotPasswordLink}
            </Link>
          </Box>
          <Button type="submit" variant="contained" loading={loading} disabled={Object.keys(errors).length > 0}>
            {generalMessages.signInHeading}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
