/*
 * Student merge: one GR per student (knowledge-base/proposals/gr-cleanup.md)
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.studentMerge';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Merge student records' },
  intro: {
    id: `${scope}.intro`,
    defaultMessage:
      'When one child has two student records, merge them so they keep one GR. The most recently issued GR stays the main one; the other becomes an old GR that still finds the student, so old cards keep working. Twins and siblings share phones and fathers: check carefully.',
  },
  tabMerge: { id: `${scope}.tabMerge`, defaultMessage: 'Merge' },
  tabHistory: { id: `${scope}.tabHistory`, defaultMessage: 'History' },

  // Picking
  firstRecord: { id: `${scope}.firstRecord`, defaultMessage: 'First record' },
  secondRecord: { id: `${scope}.secondRecord`, defaultMessage: 'Second record' },
  search: { id: `${scope}.search`, defaultMessage: 'Search by GR, name or phone' },
  searchHint: { id: `${scope}.searchHint`, defaultMessage: 'Type at least 3 characters' },
  change: { id: `${scope}.change`, defaultMessage: 'Change' },
  likely: { id: `${scope}.likely`, defaultMessage: 'Records that may be the same child' },
  likelyNone: {
    id: `${scope}.likelyNone`,
    defaultMessage: 'No likely duplicates found. You can still search for one.',
  },
  compareWith: { id: `${scope}.compareWith`, defaultMessage: 'Compare' },
  matchPHONE: { id: `${scope}.matchPHONE`, defaultMessage: 'Same phone' },
  matchIDENTITY_NUMBER: { id: `${scope}.matchIDENTITY_NUMBER`, defaultMessage: 'Same B-form' },
  matchNAME_AND_FATHER: { id: `${scope}.matchNAME_AND_FATHER`, defaultMessage: 'Same name and father' },
  matchNAME_AND_BIRTH_DATE: { id: `${scope}.matchNAME_AND_BIRTH_DATE`, defaultMessage: 'Same name and birth date' },
  sessions: { id: `${scope}.sessions`, defaultMessage: 'Sessions: {list}' },
  noSessions: { id: `${scope}.noSessions`, defaultMessage: 'No active admission' },
  sameRecord: { id: `${scope}.sameRecord`, defaultMessage: 'Pick two different records' },

  // Compare
  compareTitle: { id: `${scope}.compareTitle`, defaultMessage: 'Side by side' },
  keeps: { id: `${scope}.keeps`, defaultMessage: 'Kept (main GR)' },
  mergedIn: { id: `${scope}.mergedIn`, defaultMessage: 'Merged into it' },
  result: { id: `${scope}.result`, defaultMessage: 'After the merge' },
  grRule: { id: `${scope}.grRule`, defaultMessage: 'Which GR stays: {reason}' },
  masked: {
    id: `${scope}.masked`,
    defaultMessage: 'Phones, B-form numbers and addresses are partly hidden. Rows that differ are highlighted.',
  },
  showAll: { id: `${scope}.showAll`, defaultMessage: 'Show full details' },
  pickValue: { id: `${scope}.pickValue`, defaultMessage: 'Pick which value to keep' },
  fieldGr: { id: `${scope}.fieldGr`, defaultMessage: 'GR' },
  fieldName: { id: `${scope}.fieldName`, defaultMessage: 'Name' },
  fieldFatherName: { id: `${scope}.fieldFatherName`, defaultMessage: 'Father’s name' },
  fieldDateOfBirth: { id: `${scope}.fieldDateOfBirth`, defaultMessage: 'Birth date' },
  fieldGender: { id: `${scope}.fieldGender`, defaultMessage: 'Gender' },
  fieldPhone: { id: `${scope}.fieldPhone`, defaultMessage: 'Phone' },
  fieldAlternatePhone: { id: `${scope}.fieldAlternatePhone`, defaultMessage: 'Other phone' },
  fieldIdentityNumber: { id: `${scope}.fieldIdentityNumber`, defaultMessage: 'B-form' },
  fieldAddress: { id: `${scope}.fieldAddress`, defaultMessage: 'Address' },
  fieldPhotoAssetId: { id: `${scope}.fieldPhotoAssetId`, defaultMessage: 'Photo' },
  fieldIdentityProofAssetId: { id: `${scope}.fieldIdentityProofAssetId`, defaultMessage: 'Identity document' },
  fieldCreatedAt: { id: `${scope}.fieldCreatedAt`, defaultMessage: 'Registered' },
  fieldOldGrs: { id: `${scope}.fieldOldGrs`, defaultMessage: 'Old GRs' },
  has: { id: `${scope}.has`, defaultMessage: 'Yes' },
  none: { id: `${scope}.none`, defaultMessage: 'None' },
  gr2025: { id: `${scope}.gr2025`, defaultMessage: '2025 GR' },

  // Admissions
  admissions: { id: `${scope}.admissions`, defaultMessage: 'Admissions' },
  actionSTAY: { id: `${scope}.actionSTAY`, defaultMessage: 'Stays' },
  actionMOVE: { id: `${scope}.actionMOVE`, defaultMessage: 'Moves to the kept record' },
  actionRETIRE: { id: `${scope}.actionRETIRE`, defaultMessage: 'Retired as a duplicate' },
  actionMOVE_INACTIVE: { id: `${scope}.actionMOVE_INACTIVE`, defaultMessage: 'Moves as history' },
  keepThis: { id: `${scope}.keepThis`, defaultMessage: 'Keep this one' },
  feePaid: { id: `${scope}.feePaid`, defaultMessage: 'Fee paid' },
  interviewed: { id: `${scope}.interviewed`, defaultMessage: 'Interviewed' },
  cards: { id: `${scope}.cards`, defaultMessage: '{count} cards' },
  inactive: { id: `${scope}.inactive`, defaultMessage: 'Inactive' },
  whatHappens: { id: `${scope}.whatHappens`, defaultMessage: 'What the merge does' },
  aliasesAdded: { id: `${scope}.aliasesAdded`, defaultMessage: 'Become old GRs of {gr}: {list}' },
  cardsCancelled: {
    id: `${scope}.cardsCancelled`,
    defaultMessage:
      '{count, plural, one {# card waiting to print is cancelled} other {# cards waiting to print are cancelled}}',
  },

  // Problems
  blocking: { id: `${scope}.blocking`, defaultMessage: 'Can’t merge yet' },
  warnings: { id: `${scope}.warnings`, defaultMessage: 'Check before merging' },
  confirmDob: {
    id: `${scope}.confirmDob`,
    defaultMessage: 'The birth dates are more than a year apart, and I’ve checked it’s the same child',
  },
  force: {
    id: `${scope}.force`,
    defaultMessage: 'Both admissions have a fee paid, and I’ve checked it’s the same child',
  },
  forceReason: { id: `${scope}.forceReason`, defaultMessage: 'Why it’s the same child although both paid' },

  // Merge
  reason: { id: `${scope}.reason`, defaultMessage: 'Why these are the same child (kept in the merge record)' },
  reasonMissing: { id: `${scope}.reasonMissing`, defaultMessage: 'Write why' },
  confidence: { id: `${scope}.confidence`, defaultMessage: 'How sure' },
  confidenceNone: { id: `${scope}.confidenceNone`, defaultMessage: 'Not said' },
  confidenceCERTAIN: { id: `${scope}.confidenceCERTAIN`, defaultMessage: 'Certain' },
  confidenceHIGH: { id: `${scope}.confidenceHIGH`, defaultMessage: 'High' },
  confidenceMEDIUM: { id: `${scope}.confidenceMEDIUM`, defaultMessage: 'Medium' },
  confidenceLOW: { id: `${scope}.confidenceLOW`, defaultMessage: 'Low' },
  merge: { id: `${scope}.merge`, defaultMessage: 'Merge' },
  merged: { id: `${scope}.merged`, defaultMessage: 'Merged. {gr} is now the student’s only main GR.' },
  openProfile: { id: `${scope}.openProfile`, defaultMessage: 'Open the profile' },
  failed: { id: `${scope}.failed`, defaultMessage: 'That didn’t work' },
  previewFailed: { id: `${scope}.previewFailed`, defaultMessage: 'Couldn’t compare these records' },
  stale: {
    id: `${scope}.stale`,
    defaultMessage: 'Something changed since the comparison. It has been refreshed; check it and merge again.',
  },

  // History
  historyGr: { id: `${scope}.historyGr`, defaultMessage: 'GR (current or old)' },
  includeUndone: { id: `${scope}.includeUndone`, defaultMessage: 'Show undone' },
  colWhen: { id: `${scope}.colWhen`, defaultMessage: 'When' },
  colKind: { id: `${scope}.colKind`, defaultMessage: 'Kind' },
  colKept: { id: `${scope}.colKept`, defaultMessage: 'Kept GR' },
  colMerged: { id: `${scope}.colMerged`, defaultMessage: 'Merged GRs' },
  colReason: { id: `${scope}.colReason`, defaultMessage: 'Reason' },
  colBy: { id: `${scope}.colBy`, defaultMessage: 'By' },
  kindMERGE: { id: `${scope}.kindMERGE`, defaultMessage: 'Merge' },
  kindLEGACY_LINK: { id: `${scope}.kindLEGACY_LINK`, defaultMessage: 'Linked to 2025' },
  kindBACKFILL: { id: `${scope}.kindBACKFILL`, defaultMessage: 'Backfill' },
  kindLEGACY_MATERIALIZE: { id: `${scope}.kindLEGACY_MATERIALIZE`, defaultMessage: '2025 record made a student' },
  undone: { id: `${scope}.undone`, defaultMessage: 'Undone by {name} on {date}' },
  undo: { id: `${scope}.undo`, defaultMessage: 'Undo' },
  noHistory: { id: `${scope}.noHistory`, defaultMessage: 'No merges yet' },
  undoTitle: { id: `${scope}.undoTitle`, defaultMessage: 'Undo this change' },
  undoExplain: {
    id: `${scope}.undoExplain`,
    defaultMessage:
      'Puts the records, admissions, cards and old GRs back as they were. Only the latest change for these students can be undone; core refuses if a later merge or a new admission depends on it.',
  },
  undoReason: { id: `${scope}.undoReason`, defaultMessage: 'Why (kept in the merge record)' },
  undoDone: { id: `${scope}.undoDone`, defaultMessage: 'Undone' },

  // Profile
  findDuplicates: { id: `${scope}.findDuplicates`, defaultMessage: 'Find duplicates' },
  oldGrs: { id: `${scope}.oldGrs`, defaultMessage: 'Old GRs: {list}' },
});
