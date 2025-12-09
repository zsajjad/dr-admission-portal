/*
 * AdminUsers Messages
 *
 * This contains all the text for the AdminUsers component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.adminUsers.components';

export default defineMessages({
  heading: {
    id: `${scope}.heading`,
    defaultMessage: 'Admin Users',
  },
  inActive: {
    id: `${scope}.activate`,
    defaultMessage: 'Include Inactive',
  },
});
