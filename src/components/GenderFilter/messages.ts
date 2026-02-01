/*
 * GenderFilter Messages
 *
 * This contains all the text for the GenderFilter component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.GenderFilter';

export default defineMessages({
  genderLabel: {
    id: `${scope}.genderLabel`,
    defaultMessage: 'Gender',
  },
  male: {
    id: `${scope}.male`,
    defaultMessage: 'Male',
  },
  female: {
    id: `${scope}.female`,
    defaultMessage: 'Female',
  },
  all: {
    id: `${scope}.all`,
    defaultMessage: 'Any',
  },
});
