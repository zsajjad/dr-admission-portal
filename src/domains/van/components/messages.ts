/*
 * Van Messages
 *
 * This contains all the text for the Van component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.van.components';

export default defineMessages({
  list: {
    id: `${scope}.heading.list`,
    defaultMessage: 'Vans',
  },
  detail: {
    id: `${scope}.heading.detail`,
    defaultMessage: 'Van Details',
  },
  create: {
    id: `${scope}.heading.create`,
    defaultMessage: 'Create Van',
  },
  edit: {
    id: `${scope}.heading.edit`,
    defaultMessage: 'Edit Van',
  },
});
