/*
 * Fiqh trainings: the training catalog and settings
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.catalog';

export default defineMessages({
  help: {
    id: `${scope}.help`,
    defaultMessage:
      'Each training is required from an age (and for one gender or both). A student does every required training they haven’t passed yet; a pass counts for good, in every later year. Edits only affect new enrollments.',
  },
  trainingSection: { id: `${scope}.trainingSection`, defaultMessage: 'Training' },
  newTraining: { id: `${scope}.newTraining`, defaultMessage: 'New training' },
  code: { id: `${scope}.code`, defaultMessage: 'Code' },
  name: { id: `${scope}.name`, defaultMessage: 'Name' },
  nameUr: { id: `${scope}.nameUr`, defaultMessage: 'Name in Urdu' },
  requiredFromAge: { id: `${scope}.requiredFromAge`, defaultMessage: 'Required from age' },
  requiredFromAgeHelp: {
    id: `${scope}.requiredFromAgeHelp`,
    defaultMessage: 'Age at this session’s admission: admission year − birth year − 1',
  },
  fromAge: { id: `${scope}.fromAge`, defaultMessage: '{age}+' },
  gender: { id: `${scope}.gender`, defaultMessage: 'Gender' },
  marks: { id: `${scope}.marks`, defaultMessage: 'Pass / max' },
  maxMarks: { id: `${scope}.maxMarks`, defaultMessage: 'Max marks' },
  passMarks: { id: `${scope}.passMarks`, defaultMessage: 'Pass marks' },
  stepSkill: { id: `${scope}.stepSkill`, defaultMessage: 'Graded step by step' },
  stepSkillHelp: {
    id: `${scope}.stepSkillHelp`,
    defaultMessage: 'Testers mark each step with the results step codes, and the wrong steps are kept',
  },
  stepNone: { id: `${scope}.stepNone`, defaultMessage: 'No' },
  step_WAZU: { id: `${scope}.step_WAZU`, defaultMessage: 'Wazu steps' },
  step_NAMAZ: { id: `${scope}.step_NAMAZ`, defaultMessage: 'Namaz steps' },
  sortOrder: { id: `${scope}.sortOrder`, defaultMessage: 'Order' },
  payout: { id: `${scope}.payout`, defaultMessage: 'Pay' },
  payoutFloor: { id: `${scope}.payoutFloor`, defaultMessage: 'Floor (Rs)' },
  payoutFloorHelp: { id: `${scope}.payoutFloorHelp`, defaultMessage: 'Paid when the training is tested and failed' },
  bands: { id: `${scope}.bands`, defaultMessage: 'Bands' },
  minPct: { id: `${scope}.minPct`, defaultMessage: 'From score %' },
  amount: { id: `${scope}.amount`, defaultMessage: 'Amount (Rs)' },
  addBand: { id: `${scope}.addBand`, defaultMessage: 'Add band' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  open: { id: `${scope}.open`, defaultMessage: 'Open' },
  noTrainings: { id: `${scope}.noTrainings`, defaultMessage: 'No trainings yet' },
  deactivateConfirm: {
    id: `${scope}.deactivateConfirm`,
    defaultMessage:
      'Deactivate {name}? It stops being required for new enrollments. Passes and open enrollments keep it.',
  },
  snapshotNote: {
    id: `${scope}.snapshotNote`,
    defaultMessage: 'Changes apply to new enrollments only. Each enrollment keeps the rules it started under.',
  },
  preview: { id: `${scope}.preview`, defaultMessage: 'Pay table' },
  previewHelp: {
    id: `${scope}.previewHelp`,
    defaultMessage:
      'Paid once per enrollment, to the trainer at closure, from the best attempt: the band for the score when passed, the floor ({floor}) when tested and failed, nothing if never tested.',
  },
  bandColumn: { id: `${scope}.bandColumn`, defaultMessage: 'Score' },
  passedPay: { id: `${scope}.passedPay`, defaultMessage: 'Pay when passed' },
  belowPass: { id: `${scope}.belowPass`, defaultMessage: 'below the pass mark' },
  bandLabelTop: { id: `${scope}.bandLabelTop`, defaultMessage: '{min}%+' },
  bandLabel: { id: `${scope}.bandLabel`, defaultMessage: '{min}% to under {below}%' },
  failedPay: { id: `${scope}.failedPay`, defaultMessage: 'Tested and failed: {floor}' },
  fixIssues: { id: `${scope}.fixIssues`, defaultMessage: 'Fix these before saving:' },

  // Settings
  settings: { id: `${scope}.settings`, defaultMessage: 'Settings for every training' },
  maxAttempts: { id: `${scope}.maxAttempts`, defaultMessage: 'Attempts per session' },
  maxAttemptsHelp: {
    id: `${scope}.maxAttemptsHelp`,
    defaultMessage: 'The first attempt tests every required training; later ones only the failed ones',
  },
  retrainBelowPct: { id: `${scope}.retrainBelowPct`, defaultMessage: 'Retrain below (%)' },
  retrainBelowHelp: {
    id: `${scope}.retrainBelowHelp`,
    defaultMessage: 'Within a session, a training scored below this can be retrained and retested, even if passed',
  },
  RETRAIN_PCT_RANGE: { id: `${scope}.RETRAIN_PCT_RANGE`, defaultMessage: 'The retrain % must be 0–100' },
  autoCloseDays: { id: `${scope}.autoCloseDays`, defaultMessage: 'Auto-close after (days)' },
  autoCloseHelp: {
    id: `${scope}.autoCloseHelp`,
    defaultMessage: 'Days with no decision after a test, or no retest after a retrain',
  },
  reminderDays: { id: `${scope}.reminderDays`, defaultMessage: 'Reminder days' },
  reminderDaysHelp: { id: `${scope}.reminderDaysHelp`, defaultMessage: 'Comma separated, e.g. 7, 25' },

  // Issues
  CODE_REQUIRED: { id: `${scope}.CODE_REQUIRED`, defaultMessage: 'The training needs a code' },
  NAME_REQUIRED: { id: `${scope}.NAME_REQUIRED`, defaultMessage: 'The training needs a name' },
  AGE_RANGE: { id: `${scope}.AGE_RANGE`, defaultMessage: 'The age must be a whole number, 0–{max}' },
  MAX_MARKS_POSITIVE: { id: `${scope}.MAX_MARKS_POSITIVE`, defaultMessage: 'Max marks must be above 0' },
  PASS_MARKS_RANGE: {
    id: `${scope}.PASS_MARKS_RANGE`,
    defaultMessage: 'Pass marks must be between 0 and the max marks',
  },
  FLOOR_NEGATIVE: { id: `${scope}.FLOOR_NEGATIVE`, defaultMessage: 'The floor must be a whole amount, 0 or more' },
  BANDS_REQUIRED: { id: `${scope}.BANDS_REQUIRED`, defaultMessage: 'Add at least one band' },
  BANDS_TOO_MANY: { id: `${scope}.BANDS_TOO_MANY`, defaultMessage: 'At most {max} bands' },
  BANDS_NEED_ZERO: { id: `${scope}.BANDS_NEED_ZERO`, defaultMessage: 'The bands must include one from 0%' },
  BAND_PCT_RANGE: { id: `${scope}.BAND_PCT_RANGE`, defaultMessage: 'A band’s score % must be 0–100' },
  BAND_PCT_DUPLICATE: { id: `${scope}.BAND_PCT_DUPLICATE`, defaultMessage: 'Two bands start at the same %' },
  BAND_BELOW_FLOOR: {
    id: `${scope}.BAND_BELOW_FLOOR`,
    defaultMessage: 'Every band amount must be a whole amount of at least the floor (Rs {floor})',
  },
  MAX_ATTEMPTS_RANGE: { id: `${scope}.MAX_ATTEMPTS_RANGE`, defaultMessage: 'Attempts must be 1–{max}' },
  AUTO_CLOSE_RANGE: { id: `${scope}.AUTO_CLOSE_RANGE`, defaultMessage: 'Auto-close days must be 1–{max}' },
  REMINDER_RANGE: {
    id: `${scope}.REMINDER_RANGE`,
    defaultMessage: 'Reminder days must be whole days before the auto-close day ({autoCloseDays})',
  },
  REMINDER_DUPLICATE: { id: `${scope}.REMINDER_DUPLICATE`, defaultMessage: 'A reminder day is listed twice' },
});
