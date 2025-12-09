/*
 * AdminUsers Form Messages
 *
 * This contains all the text for the AdminUsers component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.screens.adminUsers.form';

export default defineMessages({
  add: {
    id: `${scope}.add`,
    defaultMessage: 'Add New Admin User',
  },
  edit: {
    id: `${scope}.edit`,
    defaultMessage: 'Edit Admin User',
  },
  cancel: {
    id: `${scope}.cancel`,
    defaultMessage: 'Cancel',
  },
  save: {
    id: `${scope}.save`,
    defaultMessage: 'Save',
  },
  saving: {
    id: `${scope}.saving`,
    defaultMessage: 'Saving...',
  },
  update: {
    id: `${scope}.update`,
    defaultMessage: 'Update',
  },

  // Success messages
  saveSuccess: {
    id: `${scope}.saveSuccess`,
    defaultMessage: 'Admin User saved successfully',
  },
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Admin User updated successfully',
  },
  // Error messages
  saveError: {
    id: `${scope}.saveError`,
    defaultMessage: 'Failed to save Admin User. Please try again.',
  },
  updateError: {
    id: `${scope}.updateError`,
    defaultMessage: 'Failed to update Admin User. Please try again.',
  },

  name: {
    id: `${scope}.name`,
    defaultMessage: 'Name',
  },
  email: {
    id: `${scope}.email`,
    defaultMessage: 'Email',
  },
  namePlaceholder: {
    id: `${scope}.namePlaceholder`,
    defaultMessage: 'Enter admin user name',
  },
  emailPlaceholder: {
    id: `${scope}.emailPlaceholder`,
    defaultMessage: 'Enter admin user email',
  },

  // Validation error messages
  nameRequired: {
    id: `${scope}.nameRequired`,
    defaultMessage: 'Name is required',
  },
  nameMin: {
    id: `${scope}.nameMin`,
    defaultMessage: 'Name must be at least 2 characters',
  },
  nameMax: {
    id: `${scope}.nameMax`,
    defaultMessage: 'Name must be less than 50 characters',
  },
  emailRequired: {
    id: `${scope}.emailRequired`,
    defaultMessage: 'Email is required',
  },
  emailInvalid: {
    id: `${scope}.emailInvalid`,
    defaultMessage: 'Invalid email address',
  },
});
