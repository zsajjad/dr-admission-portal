/*
 * Branches Messages
 *
 * This contains all the text for the Branches component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.branches.components';

export default defineMessages({
  list: {
    id: `${scope}.heading.list`,
    defaultMessage: 'Branches',
  },
  detail: {
    id: `${scope}.heading.detail`,
    defaultMessage: 'Branch Details',
  },
  create: {
    id: `${scope}.heading.create`,
    defaultMessage: 'Create Branch',
  },
  edit: {
    id: `${scope}.heading.edit`,
    defaultMessage: 'Edit Branch',
  },
});
