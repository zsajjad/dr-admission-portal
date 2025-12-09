/*
 * SignIn Messages
 *
 * This contains all the text for the SignIn component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.auth.SignIn';

export default defineMessages({
  signInHeading: {
    id: `${scope}.signInHeading`,
    defaultMessage: 'Sign in',
  },
  username: {
    id: `${scope}.username`,
    defaultMessage: 'Username',
  },
  forgotPasswordLink: {
    id: `${scope}.forgotPasswordLink`,
    defaultMessage: 'Forgot password?',
  },
  password: {
    id: `${scope}.password`,
    defaultMessage: 'Password',
  },

  // Validation messages
  usernameRequired: {
    id: `${scope}.usernameRequired`,
    defaultMessage: 'Username is required',
  },
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

  // Placeholders
  usernamePlaceholder: {
    id: `${scope}.usernamePlaceholder`,
    defaultMessage: 'Enter your username',
  },
  passwordPlaceholder: {
    id: `${scope}.passwordPlaceholder`,
    defaultMessage: 'Enter your password',
  },
});
