/*
 * Fiqh trainings: the age matrix
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.ageMatrix';

export default defineMessages({
  help: {
    id: `${scope}.help`,
    defaultMessage:
      'Which course a student does, by age and gender. Age is the age at admission (admission year − birth year − 1), from the current session’s admission. Ranges can’t overlap.',
  },
  rules: { id: `${scope}.rules`, defaultMessage: 'Rules' },
  minAge: { id: `${scope}.minAge`, defaultMessage: 'From age' },
  maxAge: { id: `${scope}.maxAge`, defaultMessage: 'To age' },
  gender: { id: `${scope}.gender`, defaultMessage: 'Gender' },
  addRule: { id: `${scope}.addRule`, defaultMessage: 'Add rule' },
  reset: { id: `${scope}.reset`, defaultMessage: 'Discard changes' },
  unsaved: { id: `${scope}.unsaved`, defaultMessage: 'Unsaved changes' },
  coverage: { id: `${scope}.coverage`, defaultMessage: 'Coverage' },
  coverageHelp: {
    id: `${scope}.coverageHelp`,
    defaultMessage:
      'The course each age gets. Red: more than one rule. Empty: no course, so the student can’t be enrolled.',
  },
  age: { id: `${scope}.age`, defaultMessage: 'Age' },
  uncovered: { id: `${scope}.uncovered`, defaultMessage: '{gender} with no course: ages {ages}' },
  noRules: { id: `${scope}.noRules`, defaultMessage: 'No rules yet. Add one per age range.' },
  inactiveCourse: { id: `${scope}.inactiveCourse`, defaultMessage: '{name} (inactive)' },
  savedMatrix: { id: `${scope}.savedMatrix`, defaultMessage: 'Age matrix saved' },
  rowNumber: { id: `${scope}.rowNumber`, defaultMessage: 'Row {n}' },
  AGE_INVALID: { id: `${scope}.AGE_INVALID`, defaultMessage: 'Ages must be whole numbers, 0 or more' },
  AGE_ORDER: { id: `${scope}.AGE_ORDER`, defaultMessage: '“From” is above “to”' },
  COURSE_REQUIRED: { id: `${scope}.COURSE_REQUIRED`, defaultMessage: 'Pick a course' },
  OVERLAP: { id: `${scope}.OVERLAP`, defaultMessage: 'Overlaps row {other}' },
});
