/*
 * Schools: the list of schools, colleges and universities families pick on the admission form
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.schools';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Schools' },
  tabSchools: { id: `${scope}.tabSchools`, defaultMessage: 'Schools' },
  tabUnmatched: { id: `${scope}.tabUnmatched`, defaultMessage: 'Unmatched names' },

  // Common
  all: { id: `${scope}.all`, defaultMessage: 'All' },
  notSet: { id: `${scope}.notSet`, defaultMessage: 'Not set' },
  cancel: { id: `${scope}.cancel`, defaultMessage: 'Cancel' },
  save: { id: `${scope}.save`, defaultMessage: 'Save' },
  saved: { id: `${scope}.saved`, defaultMessage: 'Saved' },
  saveFailed: { id: `${scope}.saveFailed`, defaultMessage: 'Couldn’t save. Try again.' },
  open: { id: `${scope}.open`, defaultMessage: 'Open' },
  active: { id: `${scope}.active`, defaultMessage: 'Active' },
  inactive: { id: `${scope}.inactive`, defaultMessage: 'Inactive' },

  // Fields
  name: { id: `${scope}.name`, defaultMessage: 'Name' },
  nameHelp: {
    id: `${scope}.nameHelp`,
    defaultMessage: 'The name shown on the admission form, in English. A changed name stays as a spelling.',
  },
  kind: { id: `${scope}.kind`, defaultMessage: 'Kind' },
  areas: { id: `${scope}.areas`, defaultMessage: 'Areas' },
  areasHelp: { id: `${scope}.areasHelp`, defaultMessage: 'Where its students live; the form lists it first there' },
  spellings: { id: `${scope}.spellings`, defaultMessage: 'Spellings' },
  admissions: { id: `${scope}.admissions`, defaultMessage: 'Admissions' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  search: { id: `${scope}.search`, defaultMessage: 'Name or spelling' },
  otherSpellings: {
    id: `${scope}.otherSpellings`,
    defaultMessage: '{count, plural, =0 {No other spellings} one {# other spelling} other {# other spellings}}',
  },

  // Kinds
  kindSCHOOL: { id: `${scope}.kindSCHOOL`, defaultMessage: 'School' },
  kindCOLLEGE: { id: `${scope}.kindCOLLEGE`, defaultMessage: 'College' },
  kindUNIVERSITY: { id: `${scope}.kindUNIVERSITY`, defaultMessage: 'University' },
  kindMADRASA: { id: `${scope}.kindMADRASA`, defaultMessage: 'Madrassa' },

  // Type, fee band and medium: set once per school, for each family's schooling picture
  type: { id: `${scope}.type`, defaultMessage: 'Type' },
  typeGOVERNMENT: { id: `${scope}.typeGOVERNMENT`, defaultMessage: 'Government' },
  typePRIVATE: { id: `${scope}.typePRIVATE`, defaultMessage: 'Private' },
  typeTRUST: { id: `${scope}.typeTRUST`, defaultMessage: 'Trust or semi-government' },
  typeMADRASSA: { id: `${scope}.typeMADRASSA`, defaultMessage: 'Madrassa' },
  feeBand: { id: `${scope}.feeBand`, defaultMessage: 'Fee band' },
  feeBandLOW: { id: `${scope}.feeBandLOW`, defaultMessage: 'Low fee' },
  feeBandMEDIUM: { id: `${scope}.feeBandMEDIUM`, defaultMessage: 'Medium fee' },
  feeBandHIGH: { id: `${scope}.feeBandHIGH`, defaultMessage: 'High fee' },
  medium: { id: `${scope}.medium`, defaultMessage: 'Medium' },
  mediumENGLISH: { id: `${scope}.mediumENGLISH`, defaultMessage: 'English' },
  mediumURDU: { id: `${scope}.mediumURDU`, defaultMessage: 'Urdu' },
  detailsMissing: { id: `${scope}.detailsMissing`, defaultMessage: 'Details missing' },
  detailsAll: { id: `${scope}.detailsAll`, defaultMessage: 'All' },
  detailsMissingOnly: {
    id: `${scope}.detailsMissingOnly`,
    defaultMessage: 'Type, fee band or medium missing',
  },
  missingChip: { id: `${scope}.missingChip`, defaultMessage: 'Details missing' },
  setForSelected: { id: `${scope}.setForSelected`, defaultMessage: 'Set for the selected' },
  keepAsIs: { id: `${scope}.keepAsIs`, defaultMessage: 'Keep as is' },
  apply: { id: `${scope}.apply`, defaultMessage: 'Apply' },
  applying: { id: `${scope}.applying`, defaultMessage: 'Saving {done} of {total}…' },
  applied: {
    id: `${scope}.applied`,
    defaultMessage: '{count, plural, one {# school updated} other {# schools updated}}',
  },
  appliedWithFailures: {
    id: `${scope}.appliedWithFailures`,
    defaultMessage: '{done} updated, {failed} not saved: {names}',
  },
  attributesHelp: {
    id: `${scope}.attributesHelp`,
    defaultMessage: 'Set once per school; they give each family a picture of where its children study.',
  },

  // Status filter
  activeOnly: { id: `${scope}.activeOnly`, defaultMessage: 'Active only' },
  activeAndInactive: { id: `${scope}.activeAndInactive`, defaultMessage: 'Active and inactive' },

  // List
  listHelp: {
    id: `${scope}.listHelp`,
    defaultMessage:
      'The schools, colleges and universities families pick on the admission form. Search matches every spelling. Set type, fee band and medium right in the table, or select several schools and set them together. Open a school to change its name, areas or spellings, or to merge a duplicate into it.',
  },
  addSchool: { id: `${scope}.addSchool`, defaultMessage: 'Add school' },
  noSchools: { id: `${scope}.noSchools`, defaultMessage: 'No schools found' },
  selected: {
    id: `${scope}.selected`,
    defaultMessage: '{count, plural, one {# school selected} other {# schools selected}}',
  },
  clearSelection: { id: `${scope}.clearSelection`, defaultMessage: 'Clear' },
  mergeSelected: { id: `${scope}.mergeSelected`, defaultMessage: 'Merge these two' },
  admissionsUnknown: {
    id: `${scope}.admissionsUnknown`,
    defaultMessage: 'The API sends this count to admins only',
  },

  // Create
  createTitle: { id: `${scope}.createTitle`, defaultMessage: 'New school' },
  createFromNameHelp: {
    id: `${scope}.createFromNameHelp`,
    defaultMessage:
      'The typed name and its spellings become this school’s spellings, and the admissions that used them are linked to it.',
  },
  create: { id: `${scope}.create`, defaultMessage: 'Create school' },
  created: { id: `${scope}.created`, defaultMessage: 'School created' },
  createdAndLinked: {
    id: `${scope}.createdAndLinked`,
    defaultMessage:
      'School created. {count, plural, =0 {No admissions linked} one {# admission linked} other {# admissions linked}}.',
  },
  spellingsHelp: {
    id: `${scope}.spellingsHelp`,
    defaultMessage: 'Other ways families wrote it, in English or Urdu. Press Enter after each.',
  },

  // Detail
  notFound: { id: `${scope}.notFound`, defaultMessage: 'School not found' },
  details: { id: `${scope}.details`, defaultMessage: 'Details' },
  backToList: { id: `${scope}.backToList`, defaultMessage: 'All schools' },
  spellingsCardHelp: {
    id: `${scope}.spellingsCardHelp`,
    defaultMessage:
      'Typed names that mean this school. An admission whose typed name matches one is linked to it. Adding a spelling links the admissions that used it.',
  },
  noSpellings: { id: `${scope}.noSpellings`, defaultMessage: 'Only its name so far' },
  addSpelling: { id: `${scope}.addSpelling`, defaultMessage: 'Add spelling' },
  newSpelling: { id: `${scope}.newSpelling`, defaultMessage: 'New spelling' },
  spellingAdded: {
    id: `${scope}.spellingAdded`,
    defaultMessage:
      'Spelling added. {count, plural, =0 {No admissions linked} one {# admission linked} other {# admissions linked}}.',
  },
  removeSpelling: { id: `${scope}.removeSpelling`, defaultMessage: 'Remove “{name}”' },
  removeSpellingHelp: {
    id: `${scope}.removeSpellingHelp`,
    defaultMessage: 'Admissions already linked stay linked. New admissions typed this way won’t match.',
  },
  spellingRemoved: { id: `${scope}.spellingRemoved`, defaultMessage: 'Spelling removed' },
  remove: { id: `${scope}.remove`, defaultMessage: 'Remove' },
  deactivated: { id: `${scope}.deactivated`, defaultMessage: 'School deactivated; the form no longer offers it' },
  activated: { id: `${scope}.activated`, defaultMessage: 'School active again' },
  mergeInto: { id: `${scope}.mergeInto`, defaultMessage: 'Merge a duplicate' },

  // Merge
  mergeTitle: { id: `${scope}.mergeTitle`, defaultMessage: 'Merge two schools' },
  mergeKeep: { id: `${scope}.mergeKeep`, defaultMessage: 'Keep' },
  mergeRemove: { id: `${scope}.mergeRemove`, defaultMessage: 'Merge in and delete' },
  mergeSwap: { id: `${scope}.mergeSwap`, defaultMessage: 'Swap' },
  mergePick: { id: `${scope}.mergePick`, defaultMessage: 'Pick a school' },
  mergeSummary: {
    id: `${scope}.mergeSummary`,
    defaultMessage:
      '“{remove}” will be deleted. Its {count, plural, =0 {admissions} one {# admission} other {# admissions}}, spellings and areas move to “{keep}”, which keeps its own name.',
  },
  mergeSummaryNoCount: {
    id: `${scope}.mergeSummaryNoCount`,
    defaultMessage:
      '“{remove}” will be deleted. Its admissions, spellings and areas move to “{keep}”, which keeps its own name.',
  },
  mergeCannotUndo: { id: `${scope}.mergeCannotUndo`, defaultMessage: 'This can’t be undone.' },
  mergeConfirm: { id: `${scope}.mergeConfirm`, defaultMessage: 'Merge' },
  merged: {
    id: `${scope}.merged`,
    defaultMessage:
      'Schools merged. {count, plural, =0 {No admissions moved} one {# admission moved} other {# admissions moved}}.',
  },
  mergeSame: { id: `${scope}.mergeSame`, defaultMessage: 'Pick two different schools' },

  // Unmatched names
  unmatchedHelp: {
    id: `${scope}.unmatchedHelp`,
    defaultMessage:
      'School names families typed that match no school’s spelling, most used first. Link a name to the school it means, which adds it as a spelling and links its admissions, or create a school for it.',
  },
  unmatchedCount: {
    id: `${scope}.unmatchedCount`,
    defaultMessage: '{count, plural, =0 {No unmatched names} one {# unmatched name} other {# unmatched names}}',
  },
  unmatchedShowing: {
    id: `${scope}.unmatchedShowing`,
    defaultMessage: 'Showing the {shown} most used',
  },
  noUnmatched: { id: `${scope}.noUnmatched`, defaultMessage: 'Every typed name matches a school' },
  typedName: { id: `${scope}.typedName`, defaultMessage: 'Typed name' },
  linkToSchool: { id: `${scope}.linkToSchool`, defaultMessage: 'Link to school' },
  newSchool: { id: `${scope}.newSchool`, defaultMessage: 'New school' },
  linkSelected: { id: `${scope}.linkSelected`, defaultMessage: 'Link selected to a school' },
  linkTitle: {
    id: `${scope}.linkTitle`,
    defaultMessage: '{count, plural, one {Link a name to a school} other {Link # names to a school}}',
  },
  linkHelp: {
    id: `${scope}.linkHelp`,
    defaultMessage:
      'These become spellings of the school you pick, and their {count, plural, one {# admission is} other {# admissions are}} linked to it.',
  },
  link: { id: `${scope}.link`, defaultMessage: 'Link' },
  linked: {
    id: `${scope}.linked`,
    defaultMessage:
      'Linked to {school}. {count, plural, =0 {No admissions linked} one {# admission linked} other {# admissions linked}}.',
  },
  school: { id: `${scope}.school`, defaultMessage: 'School' },
  schoolSearchHint: { id: `${scope}.schoolSearchHint`, defaultMessage: 'Type part of the name or a spelling' },
  noMatches: { id: `${scope}.noMatches`, defaultMessage: 'No school matches' },

  // Link admissions
  linkAll: { id: `${scope}.linkAll`, defaultMessage: 'Link matching admissions' },
  linkAllTitle: { id: `${scope}.linkAllTitle`, defaultMessage: 'Link admissions to their schools' },
  linkAllChecking: { id: `${scope}.linkAllChecking`, defaultMessage: 'Checking…' },
  linkAllDryRun: {
    id: `${scope}.linkAllDryRun`,
    defaultMessage:
      '{checked, plural, =0 {No admissions have} one {# admission has} other {# admissions have}} a typed school name and no school. {linked, plural, =0 {None match} one {# matches} other {# match}} a school’s spelling and can be linked; {unmatched} still match none.',
  },
  linkAllHelp: {
    id: `${scope}.linkAllHelp`,
    defaultMessage:
      'Links every admission that has a typed school name and no school yet, where the name matches a school’s spelling. Useful after an import or after editing spellings.',
  },
  linkAllDone: {
    id: `${scope}.linkAllDone`,
    defaultMessage: '{count, plural, =0 {No admissions linked} one {# admission linked} other {# admissions linked}}',
  },
});
