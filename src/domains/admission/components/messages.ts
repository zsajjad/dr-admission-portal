/*
 * Admission Messages
 *
 * This contains all the text for the Admission component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.components';

export default defineMessages({
  list: {
    id: `${scope}.heading.list`,
    defaultMessage: 'Admissions',
  },
  detail: {
    id: `${scope}.heading.detail`,
    defaultMessage: 'Admission Detail',
  },
  create: {
    id: `${scope}.heading.create`,
    defaultMessage: 'Create Admission',
  },
  edit: {
    id: `${scope}.heading.edit`,
    defaultMessage: 'Edit Admission',
  },
  fromLegacy: {
    id: `${scope}.heading.fromLegacy`,
    defaultMessage: 'Admission from Legacy Data',
  },
});
