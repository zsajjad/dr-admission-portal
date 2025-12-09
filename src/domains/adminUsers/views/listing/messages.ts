/*
 * Admin User Messages
 *
 * This contains all the text for the Admin User listing component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.adminUser.view.listing';

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
    defaultMessage: 'No Admin User Found',
  },

  // Update
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Admin User updated successfully',
  },
  errorSuccess: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },

  email: {
    id: `${scope}.email`,
    defaultMessage: 'Email',
  },
  name: {
    id: `${scope}.name`,
    defaultMessage: 'Name',
  },
  role: {
    id: `${scope}.role`,
    defaultMessage: 'Role',
  },
  createdAt: {
    id: `${scope}.createdAt`,
    defaultMessage: 'Created At',
  },
  actions: {
    id: `${scope}.actions`,
    defaultMessage: 'Actions',
  },
  loginDisabled: {
    id: `${scope}.loginDisabled`,
    defaultMessage: 'Disabled',
  },
});
