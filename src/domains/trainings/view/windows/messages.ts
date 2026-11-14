/*
 * Fiqh trainings: testing windows
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.windows';

export default defineMessages({
  help: {
    id: `${scope}.help`,
    defaultMessage:
      'Testers grade only inside an open window for their branch. A grade counts by the phone’s time, and must reach the server within the grace period after the window closes, or it’s flagged for review.',
  },
  newWindow: { id: `${scope}.newWindow`, defaultMessage: 'New window' },
  editWindow: { id: `${scope}.editWindow`, defaultMessage: 'Edit window' },
  name: { id: `${scope}.name`, defaultMessage: 'Name' },
  namePlaceholder: { id: `${scope}.namePlaceholder`, defaultMessage: 'e.g. NK test day 1' },
  opensAt: { id: `${scope}.opensAt`, defaultMessage: 'Opens' },
  opensAtHelp: { id: `${scope}.opensAtHelp`, defaultMessage: 'Leave empty to open now' },
  closesAt: { id: `${scope}.closesAt`, defaultMessage: 'Closes' },
  testers: { id: `${scope}.testers`, defaultMessage: 'Testers' },
  testersHelp: { id: `${scope}.testersHelp`, defaultMessage: 'Leave empty to let every tester grade' },
  everyTester: { id: `${scope}.everyTester`, defaultMessage: 'Every tester' },
  graded: { id: `${scope}.graded`, defaultMessage: 'Graded' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  SCHEDULED: { id: `${scope}.SCHEDULED`, defaultMessage: 'Scheduled' },
  OPEN: { id: `${scope}.OPEN`, defaultMessage: 'Open' },
  CLOSED: { id: `${scope}.CLOSED`, defaultMessage: 'Closed' },
  CLOSED_EARLY: { id: `${scope}.CLOSED_EARLY`, defaultMessage: 'Closed early' },
  closeNow: { id: `${scope}.closeNow`, defaultMessage: 'Close now' },
  closeConfirmTitle: { id: `${scope}.closeConfirmTitle`, defaultMessage: 'Close {name} now?' },
  closeConfirm: {
    id: `${scope}.closeConfirm`,
    defaultMessage:
      'Grades made on a phone after now are refused. Grades made before now still count when they arrive within the grace period.',
  },
  noWindows: { id: `${scope}.noWindows`, defaultMessage: 'No testing windows in this session' },
  pickSession: { id: `${scope}.pickSession`, defaultMessage: 'Pick a session' },
  closesBeforeOpens: { id: `${scope}.closesBeforeOpens`, defaultMessage: 'Must be after the opening time' },
  closedAt: { id: `${scope}.closedAt`, defaultMessage: 'Closed {at}' },
});
