/*
 * Session result rules: theory pass marks (kept apart from the results page's messages)
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.results.passMarks';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Theory pass marks' },
  help: {
    id: `${scope}.help`,
    defaultMessage:
      'A student passes the session with theory at or above the pass mark for their class level, and every Fiqh training required for their age passed (in any year). Empty a class level’s box to remove its pass mark: its results stay blank.',
  },
  session: { id: `${scope}.session`, defaultMessage: 'Session' },
  classLevel: { id: `${scope}.classLevel`, defaultMessage: 'Class level' },
  passMarks: { id: `${scope}.passMarks`, defaultMessage: 'Pass marks' },
  invalid: { id: `${scope}.invalid`, defaultMessage: 'A number, 0 or more' },
  save: { id: `${scope}.save`, defaultMessage: 'Save and recompute' },
  confirmTitle: { id: `${scope}.confirmTitle`, defaultMessage: 'Save and recompute the session?' },
  confirm: {
    id: `${scope}.confirm`,
    defaultMessage:
      'Saving recomputes every result and position in {session}. Locked, terminated and 2026-imported results keep their stored result.',
  },
  cancel: { id: `${scope}.cancel`, defaultMessage: 'Cancel' },
  saved: { id: `${scope}.saved`, defaultMessage: 'Saved; the session’s results were recomputed' },
  readOnly: { id: `${scope}.readOnly`, defaultMessage: 'Changing pass marks needs the results.lock permission.' },
  notAllowed: {
    id: `${scope}.notAllowed`,
    defaultMessage: 'You can’t open this page. It needs reports.view or results.lock.',
  },
  loadError: { id: `${scope}.loadError`, defaultMessage: 'Couldn’t load' },
  unsaved: { id: `${scope}.unsaved`, defaultMessage: 'Unsaved changes' },
});
