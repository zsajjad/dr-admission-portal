/*
 * Branch Form Messages
 *
 * This contains all the text for the Branch form component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.branches.view.form';

export default defineMessages({
  create: {
    id: `${scope}.create`,
    defaultMessage: 'Create New Branch',
  },
  edit: {
    id: `${scope}.edit`,
    defaultMessage: 'Edit Branch',
  },
  cancel: {
    id: `${scope}.cancel`,
    defaultMessage: 'Cancel',
  },
  save: {
    id: `${scope}.save`,
    defaultMessage: 'Save Branch',
  },
  saving: {
    id: `${scope}.saving`,
    defaultMessage: 'Saving...',
  },
  update: {
    id: `${scope}.update`,
    defaultMessage: 'Update Branch',
  },

  // Field error messages
  codeError: {
    id: `${scope}.codeRequired`,
    defaultMessage: 'Branch Code is required',
  },
  nameError: {
    id: `${scope}.nameRequired`,
    defaultMessage: 'Branch Name is required',
  },

  // Labels
  codeLabel: {
    id: `${scope}.codeLabel`,
    defaultMessage: 'Branch Code',
  },
  nameLabel: {
    id: `${scope}.nameLabel`,
    defaultMessage: 'Branch Name',
  },

  // Placeholders
  codePlaceholder: {
    id: `${scope}.codePlaceholder`,
    defaultMessage: 'Enter branch code',
  },
  namePlaceholder: {
    id: `${scope}.namePlaceholder`,
    defaultMessage: 'Enter branch name',
  },

  // Success messages
  saveSuccess: {
    id: `${scope}.saveSuccess`,
    defaultMessage: 'Branch saved successfully',
  },
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Branch updated successfully',
  },

  // Error messages
  saveError: {
    id: `${scope}.saveError`,
    defaultMessage: 'Failed to save branch. Please try again.',
  },
  updateError: {
    id: `${scope}.updateError`,
    defaultMessage: 'Failed to update branch. Please try again.',
  },
  generalError: {
    id: `${scope}.generalError`,
    defaultMessage: 'An error occurred. Please try again.',
  },
  failedToFetch: {
    id: `${scope}.failedToFetch`,
    defaultMessage: 'Failed to fetch branch',
  },
});
