import { defineMessages } from 'react-intl';

const scope = 'app.components.DetailHeader';

export default defineMessages({
  active: { id: `${scope}.active`, defaultMessage: 'Active' },
  deactivated: { id: `${scope}.deactivated`, defaultMessage: 'Deactivated' },
  edit: { id: `${scope}.edit`, defaultMessage: 'Edit' },
  deactivate: { id: `${scope}.deactivate`, defaultMessage: 'Deactivate' },
  reactivate: { id: `${scope}.reactivate`, defaultMessage: 'Reactivate' },
  added: { id: `${scope}.added`, defaultMessage: 'Added' },
  lastChanged: { id: `${scope}.lastChanged`, defaultMessage: 'Last changed' },
  by: { id: `${scope}.by`, defaultMessage: 'by {name}' },
});
