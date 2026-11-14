/*
 * Fiqh trainings: grades to review
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.grades';

export default defineMessages({
  help: {
    id: `${scope}.help`,
    defaultMessage:
      'Graded attempts to check: grades that reached the server after the grace period (late), and marks an admin changed. Open the enrollment to change marks, or the flagged item to review the sync.',
  },
  late: { id: `${scope}.late`, defaultMessage: 'Late grades' },
  overridden: { id: `${scope}.overridden`, defaultMessage: 'Changed marks' },
  yes: { id: `${scope}.yes`, defaultMessage: 'Only these' },
  window: { id: `${scope}.window`, defaultMessage: 'Window' },
  from: { id: `${scope}.from`, defaultMessage: 'From' },
  to: { id: `${scope}.to`, defaultMessage: 'To' },
  testedAt: { id: `${scope}.testedAt`, defaultMessage: 'Graded' },
  student: { id: `${scope}.student`, defaultMessage: 'Student' },
  attempt: { id: `${scope}.attempt`, defaultMessage: 'Attempt' },
  marks: { id: `${scope}.marks`, defaultMessage: 'Marks' },
  flags: { id: `${scope}.flags`, defaultMessage: 'Why' },
  lateFlag: { id: `${scope}.lateFlag`, defaultMessage: 'Late' },
  overriddenFlag: { id: `${scope}.overriddenFlag`, defaultMessage: 'Changed by {name}: {reason}' },
  openEnrollment: { id: `${scope}.openEnrollment`, defaultMessage: 'Enrollment' },
  openSyncItem: { id: `${scope}.openSyncItem`, defaultMessage: 'Flagged item' },
  noRows: { id: `${scope}.noRows`, defaultMessage: 'Nothing to review' },
});
