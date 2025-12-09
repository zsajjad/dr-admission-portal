import { defineMessages } from 'react-intl';

const scope = 'components.Asset';

export const messages = defineMessages({
  deleteConfirmationTitle: {
    id: `${scope}.deleteConfirmationTitle`,
    defaultMessage: 'Delete Image',
  },
  deleteConfirmationMessage: {
    id: `${scope}.deleteConfirmationMessage`,
    defaultMessage: 'Are you sure you want to delete this image?',
  },
  deleteConfirmationCancel: {
    id: `${scope}.deleteConfirmationCancel`,
    defaultMessage: 'Cancel',
  },
  deleteConfirmationDelete: {
    id: `${scope}.deleteConfirmationDelete`,
    defaultMessage: 'Delete',
  },
  deleteConfirmationSuccess: {
    id: `${scope}.deleteConfirmationSuccess`,
    defaultMessage: 'Image deleted successfully',
  },
  deleteConfirmationError: {
    id: `${scope}.deleteConfirmationError`,
    defaultMessage: 'Failed to delete image',
  },
  uploadedFileLabel: {
    id: `${scope}.uploadedFileLabel`,
    defaultMessage: 'Uploaded File',
  },
  uploadedFileDescription: {
    id: `${scope}.uploadedFileDescription`,
    defaultMessage: 'Click or drop a file here',
  },
  openInNewTab: {
    id: `${scope}.openInNewTab`,
    defaultMessage: 'Open in new tab',
  },
  successUpload: {
    id: `${scope}.successUpload`,
    defaultMessage: 'Image uploaded successfully',
  },
  errorUpload: {
    id: `${scope}.errorUpload`,
    defaultMessage: 'Failed to upload image',
  },
});
