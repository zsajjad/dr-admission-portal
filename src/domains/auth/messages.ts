/*
 * Auth Messages
 *
 * This contains all the text for the Auth component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.Auth';

export default defineMessages({
  heading: {
    id: `${scope}.heading`,
    defaultMessage: 'Welcome to ',
  },
  description: {
    id: `${scope}.description`,
    defaultMessage:
      'A centralized control panel that enables administrators to securely manage users, platform operations, and investments.',
  },
});
