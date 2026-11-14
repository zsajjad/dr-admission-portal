/*
 * Fiqh trainings: courses
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.courses';

export default defineMessages({
  newCourse: { id: `${scope}.newCourse`, defaultMessage: 'New course' },
  newCourseTitle: { id: `${scope}.newCourseTitle`, defaultMessage: 'New course' },
  code: { id: `${scope}.code`, defaultMessage: 'Code' },
  name: { id: `${scope}.name`, defaultMessage: 'Name' },
  nameUr: { id: `${scope}.nameUr`, defaultMessage: 'Name in Urdu' },
  trainings: { id: `${scope}.trainings`, defaultMessage: 'Trainings' },
  trainingsCount: { id: `${scope}.trainingsCount`, defaultMessage: '{count} trainings' },
  passRule: { id: `${scope}.passRule`, defaultMessage: 'All passed at {pct}%+' },
  attempts: { id: `${scope}.attempts`, defaultMessage: 'Attempts' },
  autoClose: { id: `${scope}.autoClose`, defaultMessage: 'Auto-close' },
  days: { id: `${scope}.days`, defaultMessage: '{days} days' },
  payoutRange: { id: `${scope}.payoutRange`, defaultMessage: 'Payout' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  open: { id: `${scope}.open`, defaultMessage: 'Open' },
  noCourses: { id: `${scope}.noCourses`, defaultMessage: 'No courses yet' },
  deactivateConfirm: {
    id: `${scope}.deactivateConfirm`,
    defaultMessage:
      'Deactivate {name}? Students can’t be enrolled in it, and the age matrix can’t point to it. Open enrollments carry on under their own rules.',
  },

  // Editor sections
  basics: { id: `${scope}.basics`, defaultMessage: 'Course' },
  rules: { id: `${scope}.rules`, defaultMessage: 'Rules' },
  payout: { id: `${scope}.payout`, defaultMessage: 'Payout' },
  preview: { id: `${scope}.preview`, defaultMessage: 'Payout table' },
  previewHelp: {
    id: `${scope}.previewHelp`,
    defaultMessage:
      'What the trainer earns from the best attempt: floor + (band − floor) × passed ÷ {total}, rounded down.',
  },
  previewEmpty: { id: `${scope}.previewEmpty`, defaultMessage: 'Add trainings and bands to see the payout table.' },
  bandColumn: { id: `${scope}.bandColumn`, defaultMessage: 'Weighted score (band)' },
  passedColumn: { id: `${scope}.passedColumn`, defaultMessage: '{count} passed' },
  bandLabelTop: { id: `${scope}.bandLabelTop`, defaultMessage: '{min}%+ ({amount})' },
  bandLabel: { id: `${scope}.bandLabel`, defaultMessage: '{min}% to under {below}% ({amount})' },
  snapshotNote: {
    id: `${scope}.snapshotNote`,
    defaultMessage: 'Changes apply to new enrollments only. Each enrollment keeps the rules it started under.',
  },

  // Rules fields
  retrainThresholdPct: { id: `${scope}.retrainThresholdPct`, defaultMessage: 'Pass threshold (%)' },
  retrainThresholdHelp: {
    id: `${scope}.retrainThresholdHelp`,
    defaultMessage: 'All trainings passed at this weighted score or more closes the course as passed',
  },
  maxAttempts: { id: `${scope}.maxAttempts`, defaultMessage: 'Max attempts' },
  autoCloseDays: { id: `${scope}.autoCloseDays`, defaultMessage: 'Auto-close after (days)' },
  autoCloseHelp: {
    id: `${scope}.autoCloseHelp`,
    defaultMessage: 'Days with no decision after a test, or no retest after a retrain',
  },
  reminderDays: { id: `${scope}.reminderDays`, defaultMessage: 'Reminder days' },
  reminderDaysHelp: { id: `${scope}.reminderDaysHelp`, defaultMessage: 'Comma separated, e.g. 7, 25' },
  payoutFloor: { id: `${scope}.payoutFloor`, defaultMessage: 'Floor (Rs)' },
  payoutFloorHelp: { id: `${scope}.payoutFloorHelp`, defaultMessage: 'Paid for any student who sits the test' },

  // Trainings table
  weightPct: { id: `${scope}.weightPct`, defaultMessage: 'Weight %' },
  maxMarks: { id: `${scope}.maxMarks`, defaultMessage: 'Max marks' },
  passMarks: { id: `${scope}.passMarks`, defaultMessage: 'Pass marks' },
  addTraining: { id: `${scope}.addTraining`, defaultMessage: 'Add training' },
  moveUp: { id: `${scope}.moveUp`, defaultMessage: 'Move up' },
  moveDown: { id: `${scope}.moveDown`, defaultMessage: 'Move down' },
  totalWeight: { id: `${scope}.totalWeight`, defaultMessage: 'Total weight: {total}%' },
  removedTrainings: {
    id: `${scope}.removedTrainings`,
    defaultMessage:
      'Saving deactivates {names}. Their marks stay in history, and open enrollments keep them in their rules.',
  },
  inactiveTrainings: { id: `${scope}.inactiveTrainings`, defaultMessage: 'Deactivated trainings: {names}' },

  // Bands table
  bands: { id: `${scope}.bands`, defaultMessage: 'Bands' },
  minPct: { id: `${scope}.minPct`, defaultMessage: 'From weighted %' },
  amount: { id: `${scope}.amount`, defaultMessage: 'Amount (Rs)' },
  addBand: { id: `${scope}.addBand`, defaultMessage: 'Add band' },

  // Issues
  fixIssues: { id: `${scope}.fixIssues`, defaultMessage: 'Fix these before saving:' },
  CODE_REQUIRED: { id: `${scope}.CODE_REQUIRED`, defaultMessage: 'The course needs a code' },
  NAME_REQUIRED: { id: `${scope}.NAME_REQUIRED`, defaultMessage: 'The course needs a name' },
  THRESHOLD_RANGE: { id: `${scope}.THRESHOLD_RANGE`, defaultMessage: 'The pass threshold must be 0–100' },
  MAX_ATTEMPTS_RANGE: { id: `${scope}.MAX_ATTEMPTS_RANGE`, defaultMessage: 'Max attempts must be 1–{max}' },
  AUTO_CLOSE_RANGE: { id: `${scope}.AUTO_CLOSE_RANGE`, defaultMessage: 'Auto-close days must be 1–{max}' },
  REMINDER_RANGE: {
    id: `${scope}.REMINDER_RANGE`,
    defaultMessage: 'Reminder days must be whole days before the auto-close day ({autoCloseDays})',
  },
  REMINDER_DUPLICATE: { id: `${scope}.REMINDER_DUPLICATE`, defaultMessage: 'A reminder day is listed twice' },
  FLOOR_NEGATIVE: { id: `${scope}.FLOOR_NEGATIVE`, defaultMessage: 'The floor must be a whole amount, 0 or more' },
  BANDS_REQUIRED: { id: `${scope}.BANDS_REQUIRED`, defaultMessage: 'Add at least one band' },
  BANDS_TOO_MANY: { id: `${scope}.BANDS_TOO_MANY`, defaultMessage: 'At most {max} bands' },
  BANDS_NEED_ZERO: { id: `${scope}.BANDS_NEED_ZERO`, defaultMessage: 'The bands must include one from 0%' },
  BAND_PCT_RANGE: { id: `${scope}.BAND_PCT_RANGE`, defaultMessage: 'A band’s weighted % must be 0–100' },
  BAND_PCT_DUPLICATE: { id: `${scope}.BAND_PCT_DUPLICATE`, defaultMessage: 'Two bands start at the same %' },
  BAND_BELOW_FLOOR: {
    id: `${scope}.BAND_BELOW_FLOOR`,
    defaultMessage: 'Every band amount must be a whole amount of at least the floor (Rs {floor})',
  },
  TRAININGS_REQUIRED: { id: `${scope}.TRAININGS_REQUIRED`, defaultMessage: 'Add at least one training' },
  TRAININGS_TOO_MANY: { id: `${scope}.TRAININGS_TOO_MANY`, defaultMessage: 'At most {max} trainings' },
  WEIGHTS_NOT_100: { id: `${scope}.WEIGHTS_NOT_100`, defaultMessage: 'Weights add up to {total}%, not 100%' },
  TRAINING_CODE_REQUIRED: { id: `${scope}.TRAINING_CODE_REQUIRED`, defaultMessage: 'Every training needs a code' },
  TRAINING_CODE_DUPLICATE: {
    id: `${scope}.TRAINING_CODE_DUPLICATE`,
    defaultMessage: 'Two trainings use the code {code}',
  },
  TRAINING_NAME_REQUIRED: { id: `${scope}.TRAINING_NAME_REQUIRED`, defaultMessage: 'Every training needs a name' },
  WEIGHT_RANGE: { id: `${scope}.WEIGHT_RANGE`, defaultMessage: 'A training’s weight must be above 0 and at most 100' },
  MAX_MARKS_POSITIVE: { id: `${scope}.MAX_MARKS_POSITIVE`, defaultMessage: 'Max marks must be above 0' },
  PASS_MARKS_RANGE: {
    id: `${scope}.PASS_MARKS_RANGE`,
    defaultMessage: 'Pass marks must be between 0 and the max marks',
  },
});
