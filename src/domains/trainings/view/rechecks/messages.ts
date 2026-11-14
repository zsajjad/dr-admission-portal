/*
 * Fiqh trainings: rechecks
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.rechecks';

export default defineMessages({
  // Views
  waiting: { id: `${scope}.waiting`, defaultMessage: 'Waiting for a trainer' },
  all: { id: `${scope}.all`, defaultMessage: 'All rechecks' },
  waitingHelp: {
    id: `${scope}.waitingHelp`,
    defaultMessage:
      'Failed rechecks with no trainer: the student isn’t in an open enrollment, so the training is trained again only once someone registers them. Registering the student, or a pass this session, takes them off the list. Without a session chosen, this covers the running sessions.',
  },
  allHelp: {
    id: `${scope}.allHelp`,
    defaultMessage:
      'Every training passed in an earlier session is rechecked each session: a tester grades it directly, with no training. A failed recheck is trained again this session. A recheck pays no trainer.',
  },

  // Filters and columns
  result: { id: `${scope}.result`, defaultMessage: 'Result' },
  passed: { id: `${scope}.passed`, defaultMessage: 'Passed' },
  failed: { id: `${scope}.failed`, defaultMessage: 'Failed' },
  late: { id: `${scope}.late`, defaultMessage: 'Late grades' },
  overridden: { id: `${scope}.overridden`, defaultMessage: 'Changed marks' },
  onlyThese: { id: `${scope}.onlyThese`, defaultMessage: 'Only these' },
  window: { id: `${scope}.window`, defaultMessage: 'Window' },
  from: { id: `${scope}.from`, defaultMessage: 'From' },
  to: { id: `${scope}.to`, defaultMessage: 'To' },
  testedAt: { id: `${scope}.testedAt`, defaultMessage: 'Rechecked' },
  student: { id: `${scope}.student`, defaultMessage: 'Student' },
  score: { id: `${scope}.score`, defaultMessage: 'Score' },
  scoreLine: { id: `${scope}.scoreLine`, defaultMessage: '{marks}/{max} · {pct}' },
  passMarks: { id: `${scope}.passMarks`, defaultMessage: 'pass {pass}' },
  lastTrainer: { id: `${scope}.lastTrainer`, defaultMessage: 'Last trainer' },
  lastTrainerNone: { id: `${scope}.lastTrainerNone`, defaultMessage: 'Not enrolled this session' },
  flags: { id: `${scope}.flags`, defaultMessage: 'Notes' },
  lateFlag: { id: `${scope}.lateFlag`, defaultMessage: 'Late' },
  overriddenFlag: { id: `${scope}.overriddenFlag`, defaultMessage: 'Changed by {name}: {reason}' },
  inTraining: { id: `${scope}.inTraining`, defaultMessage: 'In training' },
  openEnrollment: { id: `${scope}.openEnrollment`, defaultMessage: 'Enrollment' },
  openSyncItem: { id: `${scope}.openSyncItem`, defaultMessage: 'Flagged item' },
  noWaiting: { id: `${scope}.noWaiting`, defaultMessage: 'No failed recheck is waiting for a trainer' },
  noRows: { id: `${scope}.noRows`, defaultMessage: 'No rechecks match' },
  noTester: { id: `${scope}.noTester`, defaultMessage: '--' },

  // Register with a trainer
  register: { id: `${scope}.register`, defaultMessage: 'Register with a trainer' },
  registerShort: { id: `${scope}.registerShort`, defaultMessage: 'Register' },
  registerTitle: { id: `${scope}.registerTitle`, defaultMessage: 'Register {name} with a trainer' },
  registerExplain: {
    id: `${scope}.registerExplain`,
    defaultMessage:
      'The student is enrolled this session with the trainer below, for every training they still need to train, including {trainings}. The trainer is paid as usual for them.',
  },
  registerDefault: {
    id: `${scope}.registerDefault`,
    defaultMessage: 'Their last trainer this session, {name}, is picked. Change it if needed.',
  },
  trainerRequired: { id: `${scope}.trainerRequired`, defaultMessage: 'Pick a trainer' },
  registered: { id: `${scope}.registered`, defaultMessage: 'Registered with the trainer' },

  // Change marks
  overrideMarks: { id: `${scope}.overrideMarks`, defaultMessage: 'Change marks' },
  overrideTitle: { id: `${scope}.overrideTitle`, defaultMessage: 'Change the marks of the {training} recheck' },
  overrideExplain: {
    id: `${scope}.overrideExplain`,
    defaultMessage:
      'The session’s pass follows the new marks. If the recheck now fails, the training is trained this session: it joins the student’s open enrollment, or waits for a trainer.',
  },
  marks: { id: `${scope}.marks`, defaultMessage: 'Marks' },
  marksOutOf: { id: `${scope}.marksOutOf`, defaultMessage: 'out of {max}, pass {pass}' },
  marksOutOfMax: { id: `${scope}.marksOutOfMax`, defaultMessage: 'out of {max}' },
  marksInvalid: { id: `${scope}.marksInvalid`, defaultMessage: 'Between 0 and {max}, at most 2 decimals' },
  comment: { id: `${scope}.comment`, defaultMessage: 'Tester’s comment' },
  commentHelp: { id: `${scope}.commentHelp`, defaultMessage: 'What the student got wrong. Leave empty to clear it.' },
  newResult: { id: `${scope}.newResult`, defaultMessage: 'New result: {pct}, {result}' },
  newScore: { id: `${scope}.newScore`, defaultMessage: 'New score: {pct}' },
  noChange: { id: `${scope}.noChange`, defaultMessage: 'Change the marks or the comment' },
  stepsKept: {
    id: `${scope}.stepsKept`,
    defaultMessage: 'Graded step by step. The steps the tester recorded are kept.',
  },
});
