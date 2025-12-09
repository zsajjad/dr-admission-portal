/*
 * Branches Listing Messages
 *
 * This contains all the text for the Branches listing components.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.branches.view.listing';

export default defineMessages({
  active: {
    id: `${scope}.active`,
    defaultMessage: 'Active',
  },
  inActive: {
    id: `${scope}.inActive`,
    defaultMessage: 'In-Active',
  },
  noData: {
    id: `${scope}.noData`,
    defaultMessage: 'No Branches Found',
  },

  // Update
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Branch updated successfully',
  },
  errorSuccess: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },

  // Header Names
  codeHeaderName: {
    id: `${scope}.codeHeaderName`,
    defaultMessage: 'Code',
  },
  nameHeaderName: {
    id: `${scope}.nameHeaderName`,
    defaultMessage: 'Name',
  },
  actionsHeaderName: {
    id: `${scope}.actionsHeaderName`,
    defaultMessage: 'Actions',
  },
});
