/*
 * Sections: per session and branch, teachers, placing students, and the bulk class change
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.sections';

export default defineMessages({
  // Pages
  overviewTitle: { id: `${scope}.overviewTitle`, defaultMessage: 'Sections' },
  detailTitle: { id: `${scope}.detailTitle`, defaultMessage: 'Section' },
  overrideTitle: { id: `${scope}.overrideTitle`, defaultMessage: 'Change many classes at once' },

  // Overview
  pickSessionBranch: {
    id: `${scope}.pickSessionBranch`,
    defaultMessage: 'Pick a session and a branch to see its sections.',
  },
  lettersNote: {
    id: `${scope}.lettersNote`,
    defaultMessage:
      'Each section is one class level. Letters run across both genders of a class: for example Tiflan 1 girls A–C, boys D–F.',
  },
  noClasses: {
    id: `${scope}.noClasses`,
    defaultMessage: 'No sections and no unplaced students in this branch yet.',
  },
  unplaced: { id: `${scope}.unplaced`, defaultMessage: 'Not placed: {count}' },
  allPlaced: { id: `${scope}.allPlaced`, defaultMessage: 'All placed' },
  students: { id: `${scope}.students`, defaultMessage: 'Students: {count}' },
  noSections: { id: `${scope}.noSections`, defaultMessage: 'No sections yet' },
  noTeacher: { id: `${scope}.noTeacher`, defaultMessage: 'No teacher yet' },
  addSection: { id: `${scope}.addSection`, defaultMessage: 'Add section' },
  bulkOverride: { id: `${scope}.bulkOverride`, defaultMessage: 'Change many classes' },
  inactive: { id: `${scope}.inactive`, defaultMessage: 'Closed' },
  showClosed: { id: `${scope}.showClosed`, defaultMessage: 'Show closed sections' },

  // Create and edit
  createTitle: { id: `${scope}.createTitle`, defaultMessage: 'Add a section' },
  editTitle: { id: `${scope}.editTitle`, defaultMessage: 'Edit {name}' },
  classLevel: { id: `${scope}.classLevel`, defaultMessage: 'Class' },
  letter: { id: `${scope}.letter`, defaultMessage: 'Letter' },
  letterAuto: { id: `${scope}.letterAuto`, defaultMessage: 'Next free letter' },
  lettersInUse: { id: `${scope}.lettersInUse`, defaultMessage: 'Letters in use in {classNumber}: {letters}' },
  lettersNone: { id: `${scope}.lettersNone`, defaultMessage: 'No letters used in {classNumber} yet' },
  nameOptional: { id: `${scope}.nameOptional`, defaultMessage: 'Name (optional)' },
  nameHint: { id: `${scope}.nameHint`, defaultMessage: 'Leave empty to show the class and letter, e.g. Tiflan1 A' },
  reasonOptional: { id: `${scope}.reasonOptional`, defaultMessage: 'Reason (optional, for the audit log)' },
  created: { id: `${scope}.created`, defaultMessage: 'Section {name} added' },
  saved: { id: `${scope}.saved`, defaultMessage: 'Saved' },
  saveFailed: { id: `${scope}.saveFailed`, defaultMessage: 'Could not save' },
  loadError: { id: `${scope}.loadError`, defaultMessage: 'Could not load' },
  notFound: { id: `${scope}.notFound`, defaultMessage: 'Section not found' },
  edit: { id: `${scope}.edit`, defaultMessage: 'Edit' },
  close: { id: `${scope}.close`, defaultMessage: 'Close section' },
  reopen: { id: `${scope}.reopen`, defaultMessage: 'Reopen section' },
  closeConfirm: {
    id: `${scope}.closeConfirm`,
    defaultMessage: 'Close {name}? No one can be placed in it afterwards. You can reopen it later.',
  },
  reopenConfirm: { id: `${scope}.reopenConfirm`, defaultMessage: 'Reopen {name}?' },
  confirm: { id: `${scope}.confirm`, defaultMessage: 'Confirm' },
  closeNeedsEmpty: {
    id: `${scope}.closeNeedsEmpty`,
    defaultMessage: 'Move or take out its students before closing a section.',
  },
  closedBanner: { id: `${scope}.closedBanner`, defaultMessage: 'This section is closed. No one can be placed in it.' },

  // Detail
  session: { id: `${scope}.session`, defaultMessage: 'Session' },
  branch: { id: `${scope}.branch`, defaultMessage: 'Branch' },
  studentCount: { id: `${scope}.studentCount`, defaultMessage: 'Students' },
  teachers: { id: `${scope}.teachers`, defaultMessage: 'Teachers' },
  editTeachers: { id: `${scope}.editTeachers`, defaultMessage: 'Edit teachers' },
  teachersTitle: { id: `${scope}.teachersTitle`, defaultMessage: 'Teachers of {name}' },
  teachersHint: {
    id: `${scope}.teachersHint`,
    defaultMessage:
      'Only active staff users with the Teacher role are listed. The class teacher and assistants see this section in the staff app.',
  },
  addTeacher: { id: `${scope}.addTeacher`, defaultMessage: 'Add teacher' },
  teacher: { id: `${scope}.teacher`, defaultMessage: 'Teacher' },
  role: { id: `${scope}.role`, defaultMessage: 'Role' },
  roleCLASS_TEACHER: { id: `${scope}.roleCLASS_TEACHER`, defaultMessage: 'Class teacher' },
  roleASSISTANT: { id: `${scope}.roleASSISTANT`, defaultMessage: 'Assistant' },
  teacherInactive: { id: `${scope}.teacherInactive`, defaultMessage: 'deactivated' },
  teacherTwice: { id: `${scope}.teacherTwice`, defaultMessage: 'Each teacher can be listed once' },

  placedStudents: { id: `${scope}.placedStudents`, defaultMessage: 'Students in this section' },
  noPlaced: { id: `${scope}.noPlaced`, defaultMessage: 'No students placed yet' },
  moveTo: { id: `${scope}.moveTo`, defaultMessage: 'Move to another section' },
  moveTitle: { id: `${scope}.moveTitle`, defaultMessage: 'Move {count} students' },
  moveHint: {
    id: `${scope}.moveHint`,
    defaultMessage: 'Only sections of the same class are listed. Attendance already marked stays with this section.',
  },
  moveTarget: { id: `${scope}.moveTarget`, defaultMessage: 'Move to' },
  noOtherSections: { id: `${scope}.noOtherSections`, defaultMessage: 'There is no other open section of this class.' },
  takeOut: { id: `${scope}.takeOut`, defaultMessage: 'Take out of section' },
  takeOutConfirm: {
    id: `${scope}.takeOutConfirm`,
    defaultMessage: 'Take {count} students out of {name}? They go back to the unplaced list.',
  },
  selected: { id: `${scope}.selected`, defaultMessage: 'Selected: {count}' },

  unplacedStudents: { id: `${scope}.unplacedStudents`, defaultMessage: 'Not placed yet ({classLevel})' },
  noUnplaced: { id: `${scope}.noUnplaced`, defaultMessage: 'Every student of this class is placed' },
  onlyFeePaid: { id: `${scope}.onlyFeePaid`, defaultMessage: 'Only fee paid' },
  placeHere: { id: `${scope}.placeHere`, defaultMessage: 'Place in this section' },
  placed: { id: `${scope}.placed`, defaultMessage: 'Placed: {assigned}. Moved: {moved}.' },
  takenOut: { id: `${scope}.takenOut`, defaultMessage: 'Taken out: {count}' },

  // Columns
  grNumber: { id: `${scope}.grNumber`, defaultMessage: 'GR number' },
  name: { id: `${scope}.name`, defaultMessage: 'Name' },
  fatherName: { id: `${scope}.fatherName`, defaultMessage: 'Father name' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  fee: { id: `${scope}.fee`, defaultMessage: 'Fee' },
  feePaid: { id: `${scope}.feePaid`, defaultMessage: 'Paid' },
  feeUnpaid: { id: `${scope}.feeUnpaid`, defaultMessage: 'Unpaid' },

  // Bulk class change
  overrideIntro: {
    id: `${scope}.overrideIntro`,
    defaultMessage:
      'Paste rows of GR number and new class code, one student per row, e.g. copied from a sheet: 9221-0-0001-123456, Muhibaan5-G. The class must be for the same gender. Students moved to another class are taken out of their section.',
  },
  overrideRows: { id: `${scope}.overrideRows`, defaultMessage: 'GR number, class code' },
  overrideReason: { id: `${scope}.overrideReason`, defaultMessage: 'Reason (for the audit log)' },
  overrideLookUp: { id: `${scope}.overrideLookUp`, defaultMessage: 'Look up students' },
  overrideLookingUp: { id: `${scope}.overrideLookingUp`, defaultMessage: 'Looking up {done} of {total}' },
  overrideDryRun: { id: `${scope}.overrideDryRun`, defaultMessage: 'Check with the server (changes nothing)' },
  overrideApply: { id: `${scope}.overrideApply`, defaultMessage: 'Apply {count} changes' },
  overrideTooMany: { id: `${scope}.overrideTooMany`, defaultMessage: 'At most {max} rows at a time' },
  overrideParseError: {
    id: `${scope}.overrideParseError`,
    defaultMessage: 'Row {row}: expected a GR number and a class code',
  },
  overrideClassCodes: { id: `${scope}.overrideClassCodes`, defaultMessage: 'Class codes: {codes}' },
  overrideSessionFirst: { id: `${scope}.overrideSessionFirst`, defaultMessage: 'Pick the session first' },
  colRow: { id: `${scope}.colRow`, defaultMessage: 'Row' },
  colCurrent: { id: `${scope}.colCurrent`, defaultMessage: 'Now' },
  colNew: { id: `${scope}.colNew`, defaultMessage: 'New class' },
  colOutcome: { id: `${scope}.colOutcome`, defaultMessage: 'What happens' },
  outcomeChange: { id: `${scope}.outcomeChange`, defaultMessage: 'Class changes' },
  outcomeSame: { id: `${scope}.outcomeSame`, defaultMessage: 'Already in this class' },
  outcomeNotFound: { id: `${scope}.outcomeNotFound`, defaultMessage: 'No admission with this GR in the session' },
  outcomeBadClass: { id: `${scope}.outcomeBadClass`, defaultMessage: 'Unknown class code' },
  outcomeOtherGender: { id: `${scope}.outcomeOtherGender`, defaultMessage: 'Class is for the other gender' },
  outcomeTwice: { id: `${scope}.outcomeTwice`, defaultMessage: 'Student listed twice; only the first row counts' },
  dryRunResult: {
    id: `${scope}.dryRunResult`,
    defaultMessage:
      'The server checked {total} rows: {overridden} would change class ({sectionCleared} of them taken out of a section), {unchanged} already in that class, {rejected} refused.',
  },
  applyResult: {
    id: `${scope}.applyResult`,
    defaultMessage:
      'Done: {overridden} changed class ({sectionCleared} taken out of a section), {unchanged} already in that class, {rejected} refused.',
  },
  rejectedBy: { id: `${scope}.rejectedBy`, defaultMessage: 'Refused by the server: {reason}' },
  summaryLine: {
    id: `${scope}.summaryLine`,
    defaultMessage: 'Will change: {change} · Already in class: {same} · Can’t be sent: {bad}',
  },
  editedSinceCheck: {
    id: `${scope}.editedSinceCheck`,
    defaultMessage: 'The rows changed since the check. Look them up and check again.',
  },
});
