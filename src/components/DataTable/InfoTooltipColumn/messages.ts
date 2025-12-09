/*
 * Info Tooltip Messages
 *
 * This contains all the text for the Info Tooltip Messages.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.component.infoTooltipColumn';

export default defineMessages({
  createdAt: {
    id: `${scope}.createdAt`,
    defaultMessage: 'Created At:',
  },
  createdBy: {
    id: `${scope}.createdBy`,
    defaultMessage: 'Created By:',
  },
  updatedAt: {
    id: `${scope}.updatedAt`,
    defaultMessage: 'Updated At:',
  },
  updatedBy: {
    id: `${scope}.updatedBy`,
    defaultMessage: 'Updated By:',
  },
  isActive: {
    id: `${scope}.isActive`,
    defaultMessage: 'Status:',
  },
  active: {
    id: `${scope}.active`,
    defaultMessage: 'Active',
  },
  inActive: {
    id: `${scope}.inActive`,
    defaultMessage: 'In-Active',
  },
});
