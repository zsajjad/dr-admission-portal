/*
 * Branch Detail Messages
 *
 * This contains all the text for the Branch component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.branches.view.detail';

export default defineMessages({
  // Labels
  idLabel: {
    id: `${scope}.idLabel`,
    defaultMessage: 'ID',
  },
  codeLabel: {
    id: `${scope}.codeLabel`,
    defaultMessage: 'Branch Code',
  },
  nameLabel: {
    id: `${scope}.nameLabel`,
    defaultMessage: 'Branch Name',
  },

  // Status messages
  failToFetch: {
    id: `${scope}.failToFetch`,
    defaultMessage: 'Failed to fetch branch details',
  },
  notFound: {
    id: `${scope}.notFound`,
    defaultMessage: 'Branch Detail Not Found',
  },
  activate: {
    id: `${scope}.activate`,
    defaultMessage: 'Activate',
  },
  deactivate: {
    id: `${scope}.deactivate`,
    defaultMessage: 'Deactivate',
  },
  successUpdate: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Branch updated successfully',
  },
  errorUpdate: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },
});
