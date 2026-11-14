/*
 * Session results: entry, import, locking and positions
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.results';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Results' },
  classLevel: { id: `${scope}.classLevel`, defaultMessage: 'Class' },
  section: { id: `${scope}.section`, defaultMessage: 'Section' },
  allSections: { id: `${scope}.allSections`, defaultMessage: 'All sections' },
  notPlaced: { id: `${scope}.notPlaced`, defaultMessage: 'Not placed' },
  sectionLetter: { id: `${scope}.sectionLetter`, defaultMessage: 'Section {letter}' },
  pickFilters: {
    id: `${scope}.pickFilters`,
    defaultMessage: 'Pick a session, branch and class to see its results.',
  },
  noStudents: { id: `${scope}.noStudents`, defaultMessage: 'No students in this class' },
  loadFailed: { id: `${scope}.loadFailed`, defaultMessage: 'Couldn’t load the results.' },
  summary: {
    id: `${scope}.summary`,
    defaultMessage: '{total} students · {passed} passed · {failed} failed · {pending} not decided yet',
  },

  // The rule
  ruleTitle: { id: `${scope}.ruleTitle`, defaultMessage: 'How the result is decided' },
  rulePass: {
    id: `${scope}.rulePass`,
    defaultMessage:
      'Pass: theory marks at or above this class’s pass mark, and every Fiqh training required for the student’s age passed, this year or in an earlier year.',
  },
  rulePosition: {
    id: `${scope}.rulePosition`,
    defaultMessage:
      'Positions go only to students who passed: by theory marks, then attendance. Students tied on both share a position (1, 2, 2, 4). Boys and girls are ranked separately in each branch.',
  },
  passMark: { id: `${scope}.passMark`, defaultMessage: 'Theory pass mark: {marks}' },
  passMarkNotSet: {
    id: `${scope}.passMarkNotSet`,
    defaultMessage: 'Theory pass mark: not set yet. Until it is set, the rules leave this class’s results undecided.',
  },
  trainingsNotYet: {
    id: `${scope}.trainingsNotYet`,
    defaultMessage: 'Fiqh trainings aren’t connected to results yet; the trainings column fills in when they are.',
  },

  // Columns
  colPosition: { id: `${scope}.colPosition`, defaultMessage: 'Position among passed students' },
  colGr: { id: `${scope}.colGr`, defaultMessage: 'GR' },
  colName: { id: `${scope}.colName`, defaultMessage: 'Name' },
  colSection: { id: `${scope}.colSection`, defaultMessage: 'Section' },
  colTheory: { id: `${scope}.colTheory`, defaultMessage: 'Theory' },
  colTrainings: { id: `${scope}.colTrainings`, defaultMessage: 'Fiqh trainings' },
  colAttendance: { id: `${scope}.colAttendance`, defaultMessage: 'Attendance' },
  colResult: { id: `${scope}.colResult`, defaultMessage: 'Result' },
  positionOf: { id: `${scope}.positionOf`, defaultMessage: 'of {count}' },
  belowPassMark: { id: `${scope}.belowPassMark`, defaultMessage: 'Below the pass mark' },
  trainingsComplete: { id: `${scope}.trainingsComplete`, defaultMessage: 'All passed' },
  trainingsNone: { id: `${scope}.trainingsNone`, defaultMessage: 'None required' },
  trainingsPartial: { id: `${scope}.trainingsPartial`, defaultMessage: '{passed} of {required} passed' },
  trainingsUnknown: { id: `${scope}.trainingsUnknown`, defaultMessage: 'Not connected yet' },
  locked: { id: `${scope}.locked`, defaultMessage: 'Locked' },

  // Result
  resultPASS: { id: `${scope}.resultPASS`, defaultMessage: 'Pass' },
  resultFAIL: { id: `${scope}.resultFAIL`, defaultMessage: 'Fail' },
  resultTERMINATED: { id: `${scope}.resultTERMINATED`, defaultMessage: 'Terminated' },
  resultPending: { id: `${scope}.resultPending`, defaultMessage: 'Not decided' },
  pendingNoTheory: { id: `${scope}.pendingNoTheory`, defaultMessage: 'No theory marks yet' },
  pendingNoPassMark: { id: `${scope}.pendingNoPassMark`, defaultMessage: 'The pass mark isn’t set' },
  pendingTrainings: {
    id: `${scope}.pendingTrainings`,
    defaultMessage: 'Waiting for Fiqh trainings; fails if they aren’t passed by the end of the session',
  },
  pendingNotWorkedOut: { id: `${scope}.pendingNotWorkedOut`, defaultMessage: 'Not worked out yet' },

  // Actions
  enterMarks: { id: `${scope}.enterMarks`, defaultMessage: 'Enter theory marks' },
  import: { id: `${scope}.import`, defaultMessage: 'Import from a sheet' },
  computeRanks: { id: `${scope}.computeRanks`, defaultMessage: 'Work out positions' },
  lock: { id: `${scope}.lock`, defaultMessage: 'Lock' },
  unlock: { id: `${scope}.unlock`, defaultMessage: 'Unlock' },

  // Entry
  entryHint: {
    id: `${scope}.entryHint`,
    defaultMessage: 'Type the theory marks. Empty boxes are left as they are. Locked results can’t be changed here.',
  },
  outOf: { id: `${scope}.outOf`, defaultMessage: 'Out of' },
  reasonOptional: { id: `${scope}.reasonOptional`, defaultMessage: 'Reason (optional, kept in the audit log)' },
  saveMarks: {
    id: `${scope}.saveMarks`,
    defaultMessage: '{count, plural, one {Save # mark} other {Save # marks}}',
  },
  cancel: { id: `${scope}.cancel`, defaultMessage: 'Cancel' },
  marksSaved: {
    id: `${scope}.marksSaved`,
    defaultMessage: '{count, plural, one {# mark saved} other {# marks saved}}',
  },
  marksFailed: {
    id: `${scope}.marksFailed`,
    defaultMessage:
      '{count, plural, one {# mark wasn’t saved} other {# marks weren’t saved}}; they are still in their boxes.',
  },
  badMarks: { id: `${scope}.badMarks`, defaultMessage: 'Between 0 and {max}' },
  outOfRequired: { id: `${scope}.outOfRequired`, defaultMessage: 'Set “Out of” first' },

  // Import
  importTitle: { id: `${scope}.importTitle`, defaultMessage: 'Import marks from a sheet' },
  importHint: {
    id: `${scope}.importHint`,
    defaultMessage:
      'Paste two columns from the sheet: GR number and marks, one student per line. Old GR numbers are found too. Check first; nothing is saved until you import.',
  },
  importPart: { id: `${scope}.importPart`, defaultMessage: 'Marks for' },
  partTHEORY: { id: `${scope}.partTHEORY`, defaultMessage: 'Theory' },
  partATTENDANCE: { id: `${scope}.partATTENDANCE`, defaultMessage: 'Attendance (days present)' },
  importLines: { id: `${scope}.importLines`, defaultMessage: 'GR, marks' },
  reasonRequired: { id: `${scope}.reasonRequired`, defaultMessage: 'Reason (kept in the audit log)' },
  reasonMissing: { id: `${scope}.reasonMissing`, defaultMessage: 'Write why, for the audit log' },
  check: { id: `${scope}.check`, defaultMessage: 'Check' },
  importNow: {
    id: `${scope}.importNow`,
    defaultMessage: '{count, plural, one {Import # row} other {Import # rows}}',
  },
  rowOk: { id: `${scope}.rowOk`, defaultMessage: 'Ready' },
  rowOtherClass: { id: `${scope}.rowOtherClass`, defaultMessage: 'In {code}, not this class' },
  rowNotFound: { id: `${scope}.rowNotFound`, defaultMessage: 'No student with this GR' },
  rowNoAdmission: { id: `${scope}.rowNoAdmission`, defaultMessage: 'Not admitted this session' },
  rowBadMarks: { id: `${scope}.rowBadMarks`, defaultMessage: 'Marks must be 0 to {max}' },
  rowTwice: { id: `${scope}.rowTwice`, defaultMessage: 'The same student is on an earlier line' },
  rowOldGr: { id: `${scope}.rowOldGr`, defaultMessage: 'Old GR; current GR is {gr}' },
  unreadable: { id: `${scope}.unreadable`, defaultMessage: 'Lines {lines} couldn’t be read' },
  dryRunResult: {
    id: `${scope}.dryRunResult`,
    defaultMessage:
      'Checked with the server: {created} new, {updated} changed, {unchanged} unchanged, {rejected} refused.',
  },
  importResult: {
    id: `${scope}.importResult`,
    defaultMessage: 'Imported: {created} new, {updated} changed, {unchanged} unchanged, {rejected} refused.',
  },
  tooMany: { id: `${scope}.tooMany`, defaultMessage: 'At most {max} lines at a time' },
  colLine: { id: `${scope}.colLine`, defaultMessage: 'Line' },
  colMarks: { id: `${scope}.colMarks`, defaultMessage: 'Marks' },
  colStatus: { id: `${scope}.colStatus`, defaultMessage: 'Status' },

  // Lock
  lockTitle: { id: `${scope}.lockTitle`, defaultMessage: 'Lock results' },
  unlockTitle: { id: `${scope}.unlockTitle`, defaultMessage: 'Unlock results' },
  lockExplain: {
    id: `${scope}.lockExplain`,
    defaultMessage:
      'Locked results can’t be changed by anyone without the “change locked results” permission, and positions aren’t recalculated for them.',
  },
  unlockExplain: {
    id: `${scope}.unlockExplain`,
    defaultMessage: 'Unlocked results can be changed again, and their positions recalculated.',
  },
  lockScope: {
    id: `${scope}.lockScope`,
    defaultMessage: '{count, plural, one {# student shown} other {# students shown}}',
  },
  lockScopeNote: {
    id: `${scope}.lockScopeNote`,
    defaultMessage: 'Only students with a decided result are locked; the others have nothing to lock yet.',
  },
  lockDone: {
    id: `${scope}.lockDone`,
    defaultMessage: '{count, plural, one {# result locked} other {# results locked}}',
  },
  unlockDone: {
    id: `${scope}.unlockDone`,
    defaultMessage: '{count, plural, one {# result unlocked} other {# results unlocked}}',
  },

  // Ranks
  ranksTitle: { id: `${scope}.ranksTitle`, defaultMessage: 'Work out positions' },
  ranksExplain: {
    id: `${scope}.ranksExplain`,
    defaultMessage:
      'Works out positions for every class of this branch in this session, from the results saved now. Locked results and results imported from 2026 keep their position.',
  },
  ranksDone: {
    id: `${scope}.ranksDone`,
    defaultMessage: 'Positions worked out: {groups} classes, {ranked} students placed, {changed} results changed.',
  },
  failed: { id: `${scope}.failed`, defaultMessage: 'That didn’t work' },
});
