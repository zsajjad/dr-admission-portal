import { defineMessages } from 'react-intl';

const scope = 'app.components.RequirePermission';

export default defineMessages({
  notAllowed: {
    id: `${scope}.notAllowed`,
    defaultMessage: 'You can’t open this page. It needs the {permissions} permission; ask a super admin.',
  },
  superAdminOnly: {
    id: `${scope}.superAdminOnly`,
    defaultMessage: 'Only super admins can open this page.',
  },
  adminOnly: {
    id: `${scope}.adminOnly`,
    defaultMessage: 'Only admins can open this page.',
  },
});
