/*
 * Session dashboard messages
 */
import { defineMessages } from 'react-intl';

const scope = 'app.admission.sessionDashboard';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'Session dashboard',
  },
  subtitle: {
    id: `${scope}.subtitle`,
    defaultMessage: 'How this session is going, compared with the last one',
  },
  sessionLabel: {
    id: `${scope}.sessionLabel`,
    defaultMessage: 'Session',
  },
  compareLabel: {
    id: `${scope}.compareLabel`,
    defaultMessage: 'Compare with',
  },
  contextBefore: {
    id: `${scope}.contextBefore`,
    defaultMessage: '{days} days until {session} starts ({date})',
  },
  contextStartDay: {
    id: `${scope}.contextStartDay`,
    defaultMessage: '{session} starts today',
  },
  contextAfter: {
    id: `${scope}.contextAfter`,
    defaultMessage: 'Day {days} since {session} started ({date})',
  },
  contextCompare: {
    id: `${scope}.contextCompare`,
    defaultMessage: 'Compared with {compare} on the same day of its season ({date})',
  },
  contextNoAlign: {
    id: `${scope}.contextNoAlign`,
    defaultMessage: 'Same-day comparison is not available because a session has no start date',
  },
  contextNoCompare: {
    id: `${scope}.contextNoCompare`,
    defaultMessage: 'There is no earlier session to compare with',
  },
  noPermission: {
    id: `${scope}.noPermission`,
    defaultMessage: 'You need the “View reports” permission to see this dashboard. Ask a super admin to grant it.',
  },
  applications: {
    id: `${scope}.applications`,
    defaultMessage: 'Applications',
  },
  feePaid: {
    id: `${scope}.feePaid`,
    defaultMessage: 'Fee paid',
  },
  finalized: {
    id: `${scope}.finalized`,
    defaultMessage: 'Finalized',
  },
  stillToReturn: {
    id: `${scope}.stillToReturn`,
    defaultMessage: 'Yet to come back',
  },
  retentionRate: {
    id: `${scope}.retentionRate`,
    defaultMessage: 'Came back',
  },
  vsSameDay: {
    id: `${scope}.vsSameDay`,
    defaultMessage: '{compare} had {value} on the same day',
  },
  noSameDay: {
    id: `${scope}.noSameDay`,
    defaultMessage: 'No same-day number to compare',
  },
  endedWith: {
    id: `${scope}.endedWith`,
    defaultMessage: '{compare} ended with {value}',
  },
  ofPool: {
    id: `${scope}.ofPool`,
    defaultMessage: 'of {pool} {compare} students who can return',
  },
  returnedSoFar: {
    id: `${scope}.returnedSoFar`,
    defaultMessage: '{returned} have applied again',
  },
  points: {
    id: `${scope}.points`,
    defaultMessage: 'pts',
  },
  timelineTitle: {
    id: `${scope}.timelineTitle`,
    defaultMessage: 'Progress by day',
  },
  timelineSubtitle: {
    id: `${scope}.timelineSubtitle`,
    defaultMessage: 'Running total, with both sessions lined up by days before classes start',
  },
  axisDays: {
    id: `${scope}.axisDays`,
    defaultMessage: 'Days from the first class day (0 = start)',
  },
  today: {
    id: `${scope}.today`,
    defaultMessage: 'Today',
  },
  start: {
    id: `${scope}.start`,
    defaultMessage: 'Start',
  },
  funnelTitle: {
    id: `${scope}.funnelTitle`,
    defaultMessage: 'From application to class',
  },
  funnelSubtitle: {
    id: `${scope}.funnelSubtitle`,
    defaultMessage: 'Each step as a share of applications',
  },
  stepApplied: {
    id: `${scope}.stepApplied`,
    defaultMessage: 'Applied',
  },
  stepVerified: {
    id: `${scope}.stepVerified`,
    defaultMessage: 'Verified',
  },
  stepFeePaid: {
    id: `${scope}.stepFeePaid`,
    defaultMessage: 'Fee paid',
  },
  stepFinalized: {
    id: `${scope}.stepFinalized`,
    defaultMessage: 'Finalized',
  },
  stepPlaced: {
    id: `${scope}.stepPlaced`,
    defaultMessage: 'Placed in a section',
  },
  stepInterviewed: {
    id: `${scope}.stepInterviewed`,
    defaultMessage: 'Interviewed',
  },
  dropOff: {
    id: `${scope}.dropOff`,
    defaultMessage: '{count} fewer than the step above',
  },
  lastSessionFinal: {
    id: `${scope}.lastSessionFinal`,
    defaultMessage: '{compare} final',
  },
  rejectedNote: {
    id: `${scope}.rejectedNote`,
    defaultMessage: '{count} rejected applications are not counted',
  },
  breakdownTitle: {
    id: `${scope}.breakdownTitle`,
    defaultMessage: 'By branch, group and gender',
  },
  colBranch: {
    id: `${scope}.colBranch`,
    defaultMessage: 'Branch',
  },
  colGroup: {
    id: `${scope}.colGroup`,
    defaultMessage: 'Group',
  },
  colGender: {
    id: `${scope}.colGender`,
    defaultMessage: 'Gender',
  },
  colSameDay: {
    id: `${scope}.colSameDay`,
    defaultMessage: '{compare}, same day',
  },
  colDiff: {
    id: `${scope}.colDiff`,
    defaultMessage: 'Difference',
  },
  colFinal: {
    id: `${scope}.colFinal`,
    defaultMessage: '{compare}, final',
  },
  total: {
    id: `${scope}.total`,
    defaultMessage: 'Total',
  },
  girls: {
    id: `${scope}.girls`,
    defaultMessage: 'Girls',
  },
  boys: {
    id: `${scope}.boys`,
    defaultMessage: 'Boys',
  },
  groupTiflan: {
    id: `${scope}.groupTiflan`,
    defaultMessage: 'Tiflan',
  },
  groupMuhiban: {
    id: `${scope}.groupMuhiban`,
    defaultMessage: 'Muhibaan',
  },
  groupNasiran: {
    id: `${scope}.groupNasiran`,
    defaultMessage: 'Nasiran',
  },
  poolTitle: {
    id: `${scope}.poolTitle`,
    defaultMessage: 'Last session’s students who have not come back',
  },
  poolSubtitle: {
    id: `${scope}.poolSubtitle`,
    defaultMessage: 'Admitted in {compare}, still the right age, and no application in {session} yet',
  },
  poolSummary: {
    id: `${scope}.poolSummary`,
    defaultMessage: '{remaining} of {pool} have not applied yet',
  },
  poolLeftOut: {
    id: `${scope}.poolLeftOut`,
    defaultMessage: 'Not counted: {agedOut} now too old, {terminated} terminated',
  },
  poolEmpty: {
    id: `${scope}.poolEmpty`,
    defaultMessage: 'There is no earlier session to draw returning students from.',
  },
  byArea: {
    id: `${scope}.byArea`,
    defaultMessage: 'By area',
  },
  byClass: {
    id: `${scope}.byClass`,
    defaultMessage: 'By class',
  },
  byGroup: {
    id: `${scope}.byGroup`,
    defaultMessage: 'By group',
  },
  byBranch: {
    id: `${scope}.byBranch`,
    defaultMessage: 'By branch',
  },
  colArea: {
    id: `${scope}.colArea`,
    defaultMessage: 'Area',
  },
  colClass: {
    id: `${scope}.colClass`,
    defaultMessage: 'Class this session',
  },
  colPool: {
    id: `${scope}.colPool`,
    defaultMessage: 'Could return',
  },
  colReturned: {
    id: `${scope}.colReturned`,
    defaultMessage: 'Came back',
  },
  colRemaining: {
    id: `${scope}.colRemaining`,
    defaultMessage: 'Not yet',
  },
  showAll: {
    id: `${scope}.showAll`,
    defaultMessage: 'Show all {count}',
  },
  showLess: {
    id: `${scope}.showLess`,
    defaultMessage: 'Show fewer',
  },
  mixTitle: {
    id: `${scope}.mixTitle`,
    defaultMessage: 'New and returning applicants',
  },
  mixReturning: {
    id: `${scope}.mixReturning`,
    defaultMessage: 'Returning',
  },
  mixNew: {
    id: `${scope}.mixNew`,
    defaultMessage: 'New',
  },
  mixNote: {
    id: `${scope}.mixNote`,
    defaultMessage: 'Returning means admitted in an earlier session, or found in the 2025 records.',
  },
  feeTitle: {
    id: `${scope}.feeTitle`,
    defaultMessage: 'Fee collection',
  },
  feeInProgress: {
    id: `${scope}.feeInProgress`,
    defaultMessage: 'In progress',
  },
  feePaidToday: {
    id: `${scope}.feePaidToday`,
    defaultMessage: 'Paid today',
  },
  feeAwaiting: {
    id: `${scope}.feeAwaiting`,
    defaultMessage: 'Verified, fee not paid yet',
  },
  feeNone: {
    id: `${scope}.feeNone`,
    defaultMessage: 'No fees have been marked paid yet.',
  },
  colDate: {
    id: `${scope}.colDate`,
    defaultMessage: 'Date',
  },
  recordTitle: {
    id: `${scope}.recordTitle`,
    defaultMessage: 'All sessions on record',
  },
  recordAdmitted: {
    id: `${scope}.recordAdmitted`,
    defaultMessage: 'admitted',
  },
  recordApplications: {
    id: `${scope}.recordApplications`,
    defaultMessage: '{count} applications',
  },
  recordMix: {
    id: `${scope}.recordMix`,
    defaultMessage: '{returning} returning · {newStudents} new',
  },
  recordLegacy: {
    id: `${scope}.recordLegacy`,
    defaultMessage: 'records on file',
  },
  recordUnique: {
    id: `${scope}.recordUnique`,
    defaultMessage: '{count} different students admitted across all sessions',
  },
  noData: {
    id: `${scope}.noData`,
    defaultMessage: 'No data yet',
  },
});
