import { defineMessages } from 'react-intl';

const scope = 'app.components.KeyField';

export default defineMessages({
  required: {
    id: `${scope}.required`,
    defaultMessage: 'Required',
  },
  keyAlreadyExists: {
    id: `${scope}.keyAlreadyExists`,
    defaultMessage: 'Key already exists',
  },
  invalid: {
    id: `${scope}.invalid`,
    defaultMessage: 'Only lowercase letters, numbers, underscores, and hyphens are allowed. Try: "{suggestedKey}"',
  },
  view: {
    id: `${scope}.view`,
    defaultMessage: 'View',
  },
  lengthMsg: {
    id: `${scope}.lengthMsg`,
    defaultMessage: '{fieldLabel} must be under 100 characters',
  },
});
