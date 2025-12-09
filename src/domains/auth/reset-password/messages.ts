/*
 * ResetPassword Messages
 *
 * This contains all the text for the ResetPassword component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.auth.ResetPassword';

export default defineMessages({
  back: {
    id: `${scope}.back`,
    defaultMessage: 'Back to Login',
  },
  resetPassword: {
    id: `${scope}.resetPassword`,
    defaultMessage: 'Reset Password',
  },
  resetHeading: {
    id: `${scope}.resetHeading`,
    defaultMessage: 'Reset Your Password',
  },
  continue: {
    id: `${scope}.continue`,
    defaultMessage: 'Continue',
  },
  invalid: {
    id: `${scope}.invalid`,
    defaultMessage: 'This password reset link is invalid or has expired. Please request a new one.',
  },

  // Form Label
  newPassword: {
    id: `${scope}.newPassword`,
    defaultMessage: 'New Password',
  },
  confirmPassword: {
    id: `${scope}.confirmPassword`,
    defaultMessage: 'Confirm Password',
  },

  // Placeholder
  newPasswordPlaceholder: {
    id: `${scope}.newPasswordPlaceholder`,
    defaultMessage: 'Enter new password',
  },
  confirmPasswordPlaceholder: {
    id: `${scope}.confirmPasswordPlaceholder`,
    defaultMessage: 'Enter confirm password',
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
  newPasswordRequired: {
    id: `${scope}.newPasswordRequired`,
    defaultMessage: 'New Password is required',
  },
  confirmPasswordRequired: {
    id: `${scope}.confirmPasswordRequired`,
    defaultMessage: 'Confirm Password is required',
  },
});
