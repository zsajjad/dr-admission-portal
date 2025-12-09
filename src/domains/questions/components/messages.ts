/*
 * Questions Messages
 *
 * This contains all the text for the Questions component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.questions.components';

export default defineMessages({
  list: {
    id: `${scope}.heading.list`,
    defaultMessage: 'Question Sets',
  },
  detail: {
    id: `${scope}.heading.detail`,
    defaultMessage: 'Question Set Details',
  },
  create: {
    id: `${scope}.heading.create`,
    defaultMessage: 'Create Question Set',
  },
  edit: {
    id: `${scope}.heading.edit`,
    defaultMessage: 'Edit Question Set',
  },
});
