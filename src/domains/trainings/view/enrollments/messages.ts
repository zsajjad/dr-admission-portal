/*
 * Fiqh trainings: enrollments
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.enrollments';

export default defineMessages({
  // List
  enroll: { id: `${scope}.enroll`, defaultMessage: 'Enroll a student' },
  runAutoClose: { id: `${scope}.runAutoClose`, defaultMessage: 'Run auto-close now' },
  autoCloseDone: {
    id: `${scope}.autoCloseDone`,
    defaultMessage: 'Auto-close ran: {closed} closed, {reminded} reminders sent',
  },
  search: { id: `${scope}.search`, defaultMessage: 'GR or name' },
  state: { id: `${scope}.state`, defaultMessage: 'State' },
  gender: { id: `${scope}.gender`, defaultMessage: 'Gender' },
  stuckDays: { id: `${scope}.stuckDays`, defaultMessage: 'Stuck for (days)' },
  stuckDaysHelp: { id: `${scope}.stuckDaysHelp`, defaultMessage: 'Open, with no activity for this long' },
  clearFilters: { id: `${scope}.clearFilters`, defaultMessage: 'Clear filters' },
  grNumber: { id: `${scope}.grNumber`, defaultMessage: 'GR' },
  student: { id: `${scope}.student`, defaultMessage: 'Student' },
  attempts: { id: `${scope}.attempts`, defaultMessage: 'Attempts' },
  bestPct: { id: `${scope}.bestPct`, defaultMessage: 'Best %' },
  payout: { id: `${scope}.payout`, defaultMessage: 'Payout' },
  projected: { id: `${scope}.projected`, defaultMessage: 'projected' },
  today: { id: `${scope}.today`, defaultMessage: 'today' },
  autoCloseAt: { id: `${scope}.autoCloseAt`, defaultMessage: 'Auto-closes' },
  noEnrollments: { id: `${scope}.noEnrollments`, defaultMessage: 'No enrollments match' },

  // Detail
  backToList: { id: `${scope}.backToList`, defaultMessage: 'Enrollments' },
  openProfile: { id: `${scope}.openProfile`, defaultMessage: 'Student profile' },
  allTrainings: { id: `${scope}.allTrainings`, defaultMessage: 'All years' },
  enrolledOn: { id: `${scope}.enrolledOn`, defaultMessage: 'Enrolled {date}, age {age}' },
  round: { id: `${scope}.round`, defaultMessage: 'Round {round}' },
  attemptsOf: { id: `${scope}.attemptsOf`, defaultMessage: '{used} of {max}' },
  closedOn: { id: `${scope}.closedOn`, defaultMessage: 'Closed {date}' },
  passedYes: { id: `${scope}.passedYes`, defaultMessage: 'Passed' },
  passedNo: { id: `${scope}.passedNo`, defaultMessage: 'Not passed' },
  pendingPayout: { id: `${scope}.pendingPayout`, defaultMessage: 'Pending (projected)' },
  fixedPayout: { id: `${scope}.fixedPayout`, defaultMessage: 'Fixed at closure' },
  nextTester: { id: `${scope}.nextTester`, defaultMessage: 'Tester (next attempt)' },
  anyTester: { id: `${scope}.anyTester`, defaultMessage: 'Any tester' },
  progress: { id: `${scope}.progress`, defaultMessage: 'Progress' },
  training: { id: `${scope}.training`, defaultMessage: 'Training' },
  done: { id: `${scope}.done`, defaultMessage: 'Done' },
  pending: { id: `${scope}.pending`, defaultMessage: 'Pending' },
  noProgress: { id: `${scope}.noProgress`, defaultMessage: 'No progress yet' },
  attemptsTitle: { id: `${scope}.attemptsTitle`, defaultMessage: 'Attempts' },
  attemptNo: { id: `${scope}.attemptNo`, defaultMessage: 'Attempt {n}' },
  noAttempts: { id: `${scope}.noAttempts`, defaultMessage: 'Not tested yet' },
  best: { id: `${scope}.best`, defaultMessage: 'Best' },
  testedBy: { id: `${scope}.testedBy`, defaultMessage: 'Tested by {name}' },
  inWindow: { id: `${scope}.inWindow`, defaultMessage: 'in {window}' },
  gradedAt: { id: `${scope}.gradedAt`, defaultMessage: 'Graded {at} (phone), received {received}' },
  weightedPct: { id: `${scope}.weightedPct`, defaultMessage: 'Weighted' },
  passedCount: { id: `${scope}.passedCount`, defaultMessage: 'Passed' },
  band: { id: `${scope}.band`, defaultMessage: 'Band' },
  marks: { id: `${scope}.marks`, defaultMessage: 'Marks' },
  wasMarks: { id: `${scope}.wasMarks`, defaultMessage: 'was {marks}' },
  overridden: {
    id: `${scope}.overridden`,
    defaultMessage: 'Marks changed by {name} on {at}: {reason}',
  },
  overrideMarks: { id: `${scope}.overrideMarks`, defaultMessage: 'Change marks' },
  flag_LATE_GRADE: {
    id: `${scope}.flag_LATE_GRADE`,
    defaultMessage: 'Late: reached the server after the grace period',
  },
  flag_SENT_AFTER_LOGOUT: {
    id: `${scope}.flag_SENT_AFTER_LOGOUT`,
    defaultMessage: 'Sent after the phone was logged out',
  },
  progress_DONE: { id: `${scope}.progress_DONE`, defaultMessage: 'Done' },
  progress_CAN_RETRAIN: { id: `${scope}.progress_CAN_RETRAIN`, defaultMessage: 'Passed, can retrain' },
  progress_FAILED: { id: `${scope}.progress_FAILED`, defaultMessage: 'Failed' },
  progress_PENDING: { id: `${scope}.progress_PENDING`, defaultMessage: 'Not tested' },
  retrainChosen: { id: `${scope}.retrainChosen`, defaultMessage: 'Chosen to retrain: {trainings}' },
  progressHelp: {
    id: `${scope}.progressHelp`,
    defaultMessage:
      'Within a session, any training below {pct}% can be retrained and retested, even if passed. The best attempt counts, and a pass is never lost.',
  },
  trainingsTitle: { id: `${scope}.trainingsTitle`, defaultMessage: 'Trainings' },
  trainingsPassed: { id: `${scope}.trainingsPassed`, defaultMessage: 'Trainings passed' },
  trained: { id: `${scope}.trained`, defaultMessage: 'Trained' },
  lastActivity: { id: `${scope}.lastActivity`, defaultMessage: 'Last activity' },
  ruleLine: { id: `${scope}.ruleLine`, defaultMessage: 'Pass {pass}/{max} · pays {floor}–{top}' },
  improvingFrom: {
    id: `${scope}.improvingFrom`,
    defaultMessage: 'Improving from {pct}, passed in an earlier session. It pays only if it reaches a higher band.',
  },
  decisionDueV3: {
    id: `${scope}.decisionDueV3`,
    defaultMessage:
      'The trainer’s decision after attempt {n} is due. Failed: {failed}. Can be retrained to improve: {retrainable}. Closing now pays {now}.',
  },
  item_PENDING: { id: `${scope}.item_PENDING`, defaultMessage: 'Pending' },
  item_PASSED: { id: `${scope}.item_PASSED`, defaultMessage: 'Passed' },
  item_FAILED: { id: `${scope}.item_FAILED`, defaultMessage: 'Failed' },
  lateGrade: { id: `${scope}.lateGrade`, defaultMessage: 'Late grade' },
  wrongSteps: { id: `${scope}.wrongSteps`, defaultMessage: 'Wrong steps: {steps}' },
  repeatReason: { id: `${scope}.repeatReason`, defaultMessage: 'Enrolled again: {reason}' },
  decisionDue: {
    id: `${scope}.decisionDue`,
    defaultMessage:
      'The trainer’s decision after attempt {n} is due. Closing now pays {now}; a retest could pay {ifAllPass} if every training passes, up to {max}.',
  },
  decisionDueRetrain: {
    id: `${scope}.decisionDueRetrain`,
    defaultMessage:
      'A training failed in attempt {n}, so Retrain is suggested. Closing now pays {now}; a retest could pay {ifAllPass} if every training passes, up to {max}.',
  },
  flagOther: { id: `${scope}.flagOther`, defaultMessage: 'Flagged: {code}' },
  rulesTitle: { id: `${scope}.rulesTitle`, defaultMessage: 'Rules at enrollment' },
  rulesHelp: {
    id: `${scope}.rulesHelp`,
    defaultMessage:
      'A snapshot of the course when the student enrolled; later edits to the course don’t change it. Pass: all trainings passed at {threshold}%+. {attempts} attempts, auto-close after {days} days.',
  },
  decisions: { id: `${scope}.decisions`, defaultMessage: 'Decisions' },
  noDecisions: { id: `${scope}.noDecisions`, defaultMessage: 'No decisions yet' },
  afterAttempt: { id: `${scope}.afterAttempt`, defaultMessage: 'after attempt {n}' },
  assignments: { id: `${scope}.assignments`, defaultMessage: 'Trainer history' },
  noAssignments: { id: `${scope}.noAssignments`, defaultMessage: 'No changes' },
  fromTo: { id: `${scope}.fromTo`, defaultMessage: '{from} → {to}' },
  ledger: { id: `${scope}.ledger`, defaultMessage: 'Payout entries' },
  noLedger: {
    id: `${scope}.noLedger`,
    defaultMessage: 'None yet. Closing the enrollment adds the payout to the trainer’s ledger.',
  },
  when: { id: `${scope}.when`, defaultMessage: 'When' },
  who: { id: `${scope}.who`, defaultMessage: 'Who' },
  kind: { id: `${scope}.kind`, defaultMessage: 'Kind' },
  amount: { id: `${scope}.amount`, defaultMessage: 'Amount' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },

  // Actions
  reassignTrainer: { id: `${scope}.reassignTrainer`, defaultMessage: 'Reassign trainer' },
  assignTrainer: { id: `${scope}.assignTrainer`, defaultMessage: 'Assign trainer' },
  assignTester: { id: `${scope}.assignTester`, defaultMessage: 'Assign tester' },
  close: { id: `${scope}.close`, defaultMessage: 'Close' },
  reopen: { id: `${scope}.reopen`, defaultMessage: 'Reopen' },
  reopenFirst: { id: `${scope}.reopenFirst`, defaultMessage: 'Reopen the enrollment first' },
  newTrainer: { id: `${scope}.newTrainer`, defaultMessage: 'New trainer' },
  noTrainer: { id: `${scope}.noTrainer`, defaultMessage: 'Leave empty to unassign' },
  reassignExplain: {
    id: `${scope}.reassignExplain`,
    defaultMessage:
      'Reassignment is full: the progress so far moves with the student, and the whole payout goes to the trainer assigned at closure. {current} gets nothing for this student. Both trainers are notified.',
  },
  reassignExplainNone: {
    id: `${scope}.reassignExplainNone`,
    defaultMessage: 'The new trainer takes over the progress so far and receives the whole payout at closure.',
  },
  sameTrainer: { id: `${scope}.sameTrainer`, defaultMessage: 'Pick a different trainer' },
  testerHelp: {
    id: `${scope}.testerHelp`,
    defaultMessage:
      'Only this tester can grade the next attempt. Leave empty to let any tester grade. A trainer can’t test their own trainee.',
  },
  closeTitle: { id: `${scope}.closeTitle`, defaultMessage: 'Close this enrollment?' },
  closeExplain: {
    id: `${scope}.closeExplain`,
    defaultMessage:
      'It closes as “Closed by admin”, and {trainer} is paid {amount}: each tested training from its best attempt. The payout is fixed and goes to the ledger to approve.',
  },
  closeExplainUntested: {
    id: `${scope}.closeExplainUntested`,
    defaultMessage: 'It closes as “Closed by admin”. The student was never tested, so nothing is paid.',
  },
  reopenTitle: { id: `${scope}.reopenTitle`, defaultMessage: 'Reopen this enrollment?' },
  reopenExplain: {
    id: `${scope}.reopenExplain`,
    defaultMessage:
      'It goes back to “Tested” (or “In training” if never tested), and the trainer can decide again. An unapproved payout entry is cancelled; an approved one stays, and the difference is adjusted when it closes again.',
  },
  overrideTitle: { id: `${scope}.overrideTitle`, defaultMessage: 'Change the marks of attempt {n}' },
  overrideExplain: {
    id: `${scope}.overrideExplain`,
    defaultMessage: 'The attempt, the best attempt and the payout are worked out again, and the trainer is notified.',
  },
  overrideClosed: {
    id: `${scope}.overrideClosed`,
    defaultMessage: 'The enrollment is closed, so the payout is settled again in the ledger.',
  },
  marksOutOf: { id: `${scope}.marksOutOf`, defaultMessage: 'out of {max}, pass {pass}' },
  marksInvalid: { id: `${scope}.marksInvalid`, defaultMessage: 'Between 0 and {max}, at most 2 decimals' },
  newResult: {
    id: `${scope}.newResult`,
    defaultMessage: '{training}: {pct}, {result}, pays {payout}',
  },
  noChange: { id: `${scope}.noChange`, defaultMessage: 'Change at least one mark' },

  // Enroll
  enrollTitle: { id: `${scope}.enrollTitle`, defaultMessage: 'Enroll a student' },
  enrollGr: { id: `${scope}.enrollGr`, defaultMessage: 'GR number' },
  findStudent: { id: `${scope}.findStudent`, defaultMessage: 'Find' },
  studentNotFound: { id: `${scope}.studentNotFound`, defaultMessage: 'No student with this GR' },
  matrixCourse: { id: `${scope}.matrixCourse`, defaultMessage: 'From the age matrix: {course}' },
  matrixNone: {
    id: `${scope}.matrixNone`,
    defaultMessage: 'The age matrix has no course for this student (age {age}). Pick one.',
  },
  courseOverride: { id: `${scope}.courseOverride`, defaultMessage: 'Course' },
  useMatrix: { id: `${scope}.useMatrix`, defaultMessage: 'The age matrix’s course' },
  requiredNow: { id: `${scope}.requiredNow`, defaultMessage: 'Required now (age {age}), not yet passed' },
  improvePasses: { id: `${scope}.improvePasses`, defaultMessage: 'Also improve (optional)' },
  improvePassesHelp: {
    id: `${scope}.improvePassesHelp`,
    defaultMessage:
      'Passes from earlier sessions below 90%. They can be trained again to improve the score; they pay only if a higher band is reached.',
  },
  nothingRequired: {
    id: `${scope}.nothingRequired`,
    defaultMessage: 'Nothing is required: the student has passed every training for their age.',
  },
  trainerOptional: { id: `${scope}.trainerOptional`, defaultMessage: 'Trainer (optional)' },
  completedBefore: { id: `${scope}.completedBefore`, defaultMessage: 'Courses done before' },
  completedLine: { id: `${scope}.completedLine`, defaultMessage: '{course}, {session}: {result}, best {pct}' },
  enrollAgainReason: {
    id: `${scope}.enrollAgainReason`,
    defaultMessage: 'The student already closed {course}. Enrolling again needs a reason.',
  },
  enrolled: { id: `${scope}.enrolled`, defaultMessage: 'Enrolled' },

  // Student trainings
  studentTrainings: { id: `${scope}.studentTrainings`, defaultMessage: 'Fiqh trainings, every year' },
  studentTrainingsEmpty: { id: `${scope}.studentTrainingsEmpty`, defaultMessage: 'No Fiqh trainings yet' },
  matrixNow: { id: `${scope}.matrixNow`, defaultMessage: 'The age matrix gives {course} now' },
  openEnrollment: { id: `${scope}.openEnrollment`, defaultMessage: 'Open' },
  profileCard: { id: `${scope}.profileCard`, defaultMessage: 'Fiqh trainings' },
  profileCardSummary: {
    id: `${scope}.profileCardSummary`,
    defaultMessage: '{passed} passed, {required} required now',
  },
  passedTitle: { id: `${scope}.passedTitle`, defaultMessage: 'Passed, in any year' },
  noPasses: { id: `${scope}.noPasses`, defaultMessage: 'No trainings passed yet' },
  improvable: { id: `${scope}.improvable`, defaultMessage: 'Can improve' },
  passByTest: { id: `${scope}.passByTest`, defaultMessage: 'Passed a test' },
  passByAdmin: { id: `${scope}.passByAdmin`, defaultMessage: 'Added by an admin' },
  addPass: { id: `${scope}.addPass`, defaultMessage: 'Add a pass' },
  addPassHelp: {
    id: `${scope}.addPassHelp`,
    defaultMessage:
      'Record a training the student passed outside the app, e.g. from earlier records. It counts for good, pays nobody, and recomputes this session’s result.',
  },
  revoke: { id: `${scope}.revoke`, defaultMessage: 'Revoke' },
  revokeTitle: { id: `${scope}.revokeTitle`, defaultMessage: 'Revoke the {training} pass?' },
  revokeHelp: {
    id: `${scope}.revokeHelp`,
    defaultMessage: 'The training becomes required again, and this session’s result is recomputed.',
  },
  profileCardLink: { id: `${scope}.profileCardLink`, defaultMessage: 'See all' },
});
