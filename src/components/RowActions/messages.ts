/*
 * RowActions Messages
 *
 * This contains all the text for the RowActions component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.RowActions';

export default defineMessages({
  edit: {
    id: `${scope}.edit`,
    defaultMessage: 'Edit',
  },
  activate: {
    id: `${scope}.activate`,
    defaultMessage: 'Active',
  },
  deactivate: {
    id: `${scope}.deactivate`,
    defaultMessage: 'In-Active',
  },
  delete: {
    id: `${scope}.delete`,
    defaultMessage: 'Delete',
  },
  view: {
    id: `${scope}.view`,
    defaultMessage: 'View',
  },
  enable: {
    id: `${scope}.enable`,
    defaultMessage: 'Enable',
  },
  retry: {
    id: `${scope}.retry`,
    defaultMessage: 'Retry',
  },
});
