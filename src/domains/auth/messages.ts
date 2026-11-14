/*
 * Auth Messages
 *
 * This contains all the text for the Auth component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.Auth';

export default defineMessages({
  heading: {
    id: `${scope}.heading`,
    defaultMessage: 'Danishgah-e-Ramzan Admin',
  },
  description: {
    id: `${scope}.description`,
    defaultMessage:
      'Admissions, fee days, sections, interviews, attendance, trainings and results for the Ramadan classes.',
  },
  foundation: {
    id: `${scope}.foundation`,
    defaultMessage: 'A program of the Aba Saleh Foundation',
  },
});
