/*
 * Van Form Messages
 *
 * This contains all the text for the Van form component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.van.view.form';

export default defineMessages({
  create: {
    id: `${scope}.create`,
    defaultMessage: 'Create New Van',
  },
  edit: {
    id: `${scope}.edit`,
    defaultMessage: 'Edit Van',
  },
  cancel: {
    id: `${scope}.cancel`,
    defaultMessage: 'Cancel',
  },
  save: {
    id: `${scope}.save`,
    defaultMessage: 'Save Van',
  },
  saving: {
    id: `${scope}.saving`,
    defaultMessage: 'Saving...',
  },
  update: {
    id: `${scope}.update`,
    defaultMessage: 'Update Van',
  },

  // Field error messages
  branchError: {
    id: `${scope}.branchRequired`,
    defaultMessage: 'Branch is required',
  },
  codeError: {
    id: `${scope}.codeRequired`,
    defaultMessage: 'Van Code is required',
  },
  nameError: {
    id: `${scope}.nameRequired`,
    defaultMessage: 'Van Name is required',
  },
  colorNameError: {
    id: `${scope}.colorNameRequired`,
    defaultMessage: 'Color Name is required',
  },
  colorHexError: {
    id: `${scope}.colorHexRequired`,
    defaultMessage: 'Color Hex is required',
  },
  colorHexInvalidError: {
    id: `${scope}.colorHexInvalid`,
    defaultMessage: 'Invalid hex color format (e.g. #FF5733)',
  },

  // Labels
  branchLabel: {
    id: `${scope}.branchLabel`,
    defaultMessage: 'Branch',
  },
  codeLabel: {
    id: `${scope}.codeLabel`,
    defaultMessage: 'Van Code',
  },
  nameLabel: {
    id: `${scope}.nameLabel`,
    defaultMessage: 'Van Name',
  },
  colorNameLabel: {
    id: `${scope}.colorNameLabel`,
    defaultMessage: 'Color Name',
  },
  colorHexLabel: {
    id: `${scope}.colorHexLabel`,
    defaultMessage: 'Color Hex',
  },
  areasLabel: {
    id: `${scope}.areasLabel`,
    defaultMessage: 'Areas',
  },

  // Placeholders
  branchPlaceholder: {
    id: `${scope}.branchPlaceholder`,
    defaultMessage: 'Select branch',
  },
  codePlaceholder: {
    id: `${scope}.codePlaceholder`,
    defaultMessage: 'Enter van code',
  },
  namePlaceholder: {
    id: `${scope}.namePlaceholder`,
    defaultMessage: 'Enter van name',
  },
  colorNamePlaceholder: {
    id: `${scope}.colorNamePlaceholder`,
    defaultMessage: 'Enter color name (e.g. Red)',
  },
  colorHexPlaceholder: {
    id: `${scope}.colorHexPlaceholder`,
    defaultMessage: '#FF5733',
  },
  areasPlaceholder: {
    id: `${scope}.areasPlaceholder`,
    defaultMessage: 'Select areas',
  },

  // Success messages
  saveSuccess: {
    id: `${scope}.saveSuccess`,
    defaultMessage: 'Van saved successfully',
  },
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Van updated successfully',
  },

  // Error messages
  saveError: {
    id: `${scope}.saveError`,
    defaultMessage: 'Failed to save van. Please try again.',
  },
  updateError: {
    id: `${scope}.updateError`,
    defaultMessage: 'Failed to update van. Please try again.',
  },
  generalError: {
    id: `${scope}.generalError`,
    defaultMessage: 'An error occurred. Please try again.',
  },
  failedToFetch: {
    id: `${scope}.failedToFetch`,
    defaultMessage: 'Failed to fetch van',
  },
});
