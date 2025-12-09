/*
 * ChangePassword Messages
 *
 * This contains all the text for the ChangePassword component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.auth.ChangePassword';

export default defineMessages({
  changeHeading: {
    id: `${scope}.changeHeading`,
    defaultMessage: "Let's Change Your Password here!",
  },
  newPassword: {
    id: `${scope}.newPassword`,
    defaultMessage: 'New Password',
  },
  currentPassword: {
    id: `${scope}.currentPassword`,
    defaultMessage: 'Current Password',
  },
  confirmPassword: {
    id: `${scope}.confirmPassword`,
    defaultMessage: 'Confirm Password',
  },
  submit: {
    id: `${scope}.submit`,
    defaultMessage: 'Submit',
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
  currentPasswordRequired: {
    id: `${scope}.currentPasswordRequired`,
    defaultMessage: 'Current Password is required',
  },
  newPasswordRequired: {
    id: `${scope}.newPasswordRequired`,
    defaultMessage: 'New Password is required',
  },
  confirmPasswordRequired: {
    id: `${scope}.confirmPasswordRequired`,
    defaultMessage: 'Confirm Password is required',
  },
  passwordMinCharacters: {
    id: `${scope}.passwordMinCharacters`,
    defaultMessage: 'Password must be at least 8 characters',
  },
  passwordUppercase: {
    id: `${scope}.passwordUppercase`,
    defaultMessage: 'Must contain at least one uppercase letter',
  },
  passwordNumber: {
    id: `${scope}.passwordNumber`,
    defaultMessage: 'Must contain at least one number',
  },
  passwordSpecialCharacter: {
    id: `${scope}.passwordSpecialCharacter`,
    defaultMessage: 'Must contain at least one special character',
  },
  passwordNotSame: {
    id: `${scope}.passwordNotSame`,
    defaultMessage: 'New Password cannot be the same as current password',
  },
  passwordNotMatch: {
    id: `${scope}.passwordNotMatch`,
    defaultMessage: 'Passwords do not match',
  },

  // Placeholders
  currentPasswordPlaceholder: {
    id: `${scope}.currentPasswordPlaceholder`,
    defaultMessage: 'Enter current password',
  },
  newPasswordPlaceholder: {
    id: `${scope}.newPasswordPlaceholder`,
    defaultMessage: 'Enter new password (Abc123@abc)',
  },
  confirmPasswordPlaceholder: {
    id: `${scope}.confirmPasswordPlaceholder`,
    defaultMessage: 'Enter confirm password',
  },
});
