/*
 * Fiqh trainings: reports
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.reports';

export default defineMessages({
  pipeline: { id: `${scope}.pipeline`, defaultMessage: 'Pipeline' },
  results: { id: `${scope}.results`, defaultMessage: 'Results' },
  trainings: { id: `${scope}.trainings`, defaultMessage: 'Trainings' },
  trainers: { id: `${scope}.trainers`, defaultMessage: 'Trainers' },
  testers: { id: `${scope}.testers`, defaultMessage: 'Testers' },
  payouts: { id: `${scope}.payouts`, defaultMessage: 'Payouts' },
  from: { id: `${scope}.from`, defaultMessage: 'From' },
  to: { id: `${scope}.to`, defaultMessage: 'To' },
  groupBy: { id: `${scope}.groupBy`, defaultMessage: 'Split by' },
  gender: { id: `${scope}.gender`, defaultMessage: 'Gender' },
  area: { id: `${scope}.area`, defaultMessage: 'Area' },
  branch: { id: `${scope}.branch`, defaultMessage: 'Branch' },
  group: { id: `${scope}.group`, defaultMessage: 'Group' },
  allStudents: { id: `${scope}.allStudents`, defaultMessage: 'All' },
  stuckDays: { id: `${scope}.stuckDays`, defaultMessage: 'Stuck after (days)' },
  stuck: { id: `${scope}.stuck`, defaultMessage: 'Stuck' },
  total: { id: `${scope}.total`, defaultMessage: 'Total' },
  tested: { id: `${scope}.tested`, defaultMessage: 'Tested' },
  passed: { id: `${scope}.passed`, defaultMessage: 'Passed' },
  passRate: { id: `${scope}.passRate`, defaultMessage: 'Pass rate' },
  averageScore: { id: `${scope}.averageScore`, defaultMessage: 'Average' },
  retested: { id: `${scope}.retested`, defaultMessage: 'Retested' },
  firstAttempt: { id: `${scope}.firstAttempt`, defaultMessage: '1st attempt avg' },
  secondAttempt: { id: `${scope}.secondAttempt`, defaultMessage: '2nd attempt avg' },
  improvement: { id: `${scope}.improvement`, defaultMessage: 'Avg improvement' },
  distribution: { id: `${scope}.distribution`, defaultMessage: 'Score distribution: {group}' },
  students: { id: `${scope}.students`, defaultMessage: 'Students' },
  graded: { id: `${scope}.graded`, defaultMessage: 'Graded' },
  averagePct: { id: `${scope}.averagePct`, defaultMessage: 'Average %' },
  retrainRate: { id: `${scope}.retrainRate`, defaultMessage: 'Retrain rate' },
  retrainRateHelp: {
    id: `${scope}.retrainRateHelp`,
    defaultMessage:
      'Share of tested students the trainer chose to retrain: failed trainings, or passed ones below 90% to improve the score and pay.',
  },
  payoutTotal: { id: `${scope}.payoutTotal`, defaultMessage: 'Payout total' },
  window: { id: `${scope}.window`, defaultMessage: 'Window' },
  averageGiven: { id: `${scope}.averageGiven`, defaultMessage: 'Average given' },
  overridden: { id: `${scope}.overridden`, defaultMessage: 'Overridden' },
  justAbovePass: { id: `${scope}.justAbovePass`, defaultMessage: 'Just above pass' },
  justAbovePassHelp: {
    id: `${scope}.justAbovePassHelp`,
    defaultMessage:
      'Marks within 5% of the maximum above a pass mark. A tester with many of these may be pushing borderline marks over the line.',
  },
  pending: { id: `${scope}.pending`, defaultMessage: 'Pending' },
  payable: { id: `${scope}.payable`, defaultMessage: 'Awaiting approval' },
  approved: { id: `${scope}.approved`, defaultMessage: 'Approved' },
  paid: { id: `${scope}.paid`, defaultMessage: 'Paid' },
  training: { id: `${scope}.training`, defaultMessage: 'Training' },
  noData: { id: `${scope}.noData`, defaultMessage: 'No data for these filters' },
});
