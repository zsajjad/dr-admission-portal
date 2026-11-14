/*
 * Side nav group headings
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.Layout.NavGroups';

export default defineMessages({
  admissions: {
    id: `${scope}.admissions`,
    defaultMessage: 'Admissions',
  },
  session: {
    id: `${scope}.session`,
    defaultMessage: 'Session',
  },
  staff: {
    id: `${scope}.staff`,
    defaultMessage: 'Staff',
  },
  setup: {
    id: `${scope}.setup`,
    defaultMessage: 'Setup',
  },
});
