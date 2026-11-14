/*
 * Fiqh trainings: shared messages
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Fiqh trainings' },

  // Tabs
  tabCourses: { id: `${scope}.tabCourses`, defaultMessage: 'Courses' },
  tabAgeMatrix: { id: `${scope}.tabAgeMatrix`, defaultMessage: 'Age matrix' },
  tabWindows: { id: `${scope}.tabWindows`, defaultMessage: 'Testing windows' },

  // Common
  save: { id: `${scope}.save`, defaultMessage: 'Save' },
  cancel: { id: `${scope}.cancel`, defaultMessage: 'Cancel' },
  edit: { id: `${scope}.edit`, defaultMessage: 'Edit' },
  add: { id: `${scope}.add`, defaultMessage: 'Add' },
  remove: { id: `${scope}.remove`, defaultMessage: 'Remove' },
  saved: { id: `${scope}.saved`, defaultMessage: 'Saved' },
  saveFailed: { id: `${scope}.saveFailed`, defaultMessage: 'Couldn’t save' },
  loadError: { id: `${scope}.loadError`, defaultMessage: 'Couldn’t load' },
  required: { id: `${scope}.required`, defaultMessage: 'Required' },
  reason: { id: `${scope}.reason`, defaultMessage: 'Reason' },
  reasonHelp: { id: `${scope}.reasonHelp`, defaultMessage: 'Kept in the audit log' },
  active: { id: `${scope}.active`, defaultMessage: 'Active' },
  inactive: { id: `${scope}.inactive`, defaultMessage: 'Inactive' },
  activate: { id: `${scope}.activate`, defaultMessage: 'Activate' },
  deactivate: { id: `${scope}.deactivate`, defaultMessage: 'Deactivate' },
  all: { id: `${scope}.all`, defaultMessage: 'All' },
  both: { id: `${scope}.both`, defaultMessage: 'Both' },
  boys: { id: `${scope}.boys`, defaultMessage: 'Boys' },
  girls: { id: `${scope}.girls`, defaultMessage: 'Girls' },
  none: { id: `${scope}.none`, defaultMessage: 'None' },
  noRows: { id: `${scope}.noRows`, defaultMessage: 'Nothing here yet' },
  readOnly: {
    id: `${scope}.readOnly`,
    defaultMessage: 'You can view this. Changing it needs the {permission} permission.',
  },
  session: { id: `${scope}.session`, defaultMessage: 'Session' },
  branch: { id: `${scope}.branch`, defaultMessage: 'Branch' },
  allBranches: { id: `${scope}.allBranches`, defaultMessage: 'All branches' },
  course: { id: `${scope}.course`, defaultMessage: 'Course' },
  trainer: { id: `${scope}.trainer`, defaultMessage: 'Trainer' },
  tester: { id: `${scope}.tester`, defaultMessage: 'Tester' },
  rupees: { id: `${scope}.rupees`, defaultMessage: 'Rs {amount}' },
});
