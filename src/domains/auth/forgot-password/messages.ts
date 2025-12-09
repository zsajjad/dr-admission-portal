/*
 * ForgotPassword Messages
 *
 * This contains all the text for the ForgotPassword component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.auth.ForgotPassword';

export default defineMessages({
  email: {
    id: `${scope}.email`,
    defaultMessage: 'Email Address',
  },
  forgotHeading: {
    id: `${scope}.forgotHeading`,
    defaultMessage: 'Forgot Your Password?',
  },
  resetPassword: {
    id: `${scope}.resetPassword`,
    defaultMessage: 'Reset Password',
  },
  back: {
    id: `${scope}.back`,
    defaultMessage: 'Back to Login',
  },

  // Validation messages
  captchaRequired: {
    id: `${scope}.captchaRequired`,
    defaultMessage: 'Captcha is required',
  },
  captchaResetKeyRequired: {
    id: `${scope}.captchaResetKeyRequired`,
    defaultMessage: 'Captcha reset key is required',
  },
  emailRequired: {
    id: `${scope}.emailRequired`,
    defaultMessage: 'Email is required',
  },
  invalidEmail: {
    id: `${scope}.invalidEmail`,
    defaultMessage: 'Invalid Email',
  },

  // Placeholders
  emailPlaceholder: {
    id: `${scope}.emailPlaceholder`,
    defaultMessage: 'Enter your email address',
  },
});
