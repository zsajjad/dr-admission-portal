/*
 * CreatePassword Messages
 *
 * This contains all the text for the CreatePassword component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.auth.CreatePassword';

export default defineMessages({
  createHeading: {
    id: `${scope}.createHeading`,
    defaultMessage: "Welcome! Let's Set Your New Password",
  },

  // Form input
  newPassword: {
    id: `${scope}.newPassword`,
    defaultMessage: 'New Password',
  },

  // Placeholder
  newPasswordPlaceholder: {
    id: `${scope}.newPasswordPlaceholder`,
    defaultMessage: 'Enter new password',
  },

  // Validation messages
  passwordRequired: {
    id: `${scope}.passwordRequired`,
    defaultMessage: 'Password is required',
  },
  captchaRequired: {
    id: `${scope}.captchaRequired`,
    defaultMessage: 'Captcha is required',
  },
  captchaResetKeyRequired: {
    id: `${scope}.captchaResetKeyRequired`,
    defaultMessage: 'Captcha reset key is required',
  },
});
