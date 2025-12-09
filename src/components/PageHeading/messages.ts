/*
 * PageHeading Messages
 *
 * This contains all the text for the PageHeading component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.RowActions';

export default defineMessages({
  addNew: {
    id: `${scope}.addNew`,
    defaultMessage: 'Add New',
  },
  edit: {
    id: `${scope}.edit`,
    defaultMessage: 'Edit',
  },
  inActive: {
    id: `${scope}.activate`,
    defaultMessage: 'Include In-Active',
  },
});
