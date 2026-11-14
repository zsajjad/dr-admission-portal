/*
 * Fiqh trainings: shared messages
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Fiqh trainings' },

  // Tabs
  tabEnrollments: { id: `${scope}.tabEnrollments`, defaultMessage: 'Enrollments' },
  tabCatalog: { id: `${scope}.tabCatalog`, defaultMessage: 'Training catalog' },
  tabWindows: { id: `${scope}.tabWindows`, defaultMessage: 'Testing windows' },
  tabLedger: { id: `${scope}.tabLedger`, defaultMessage: 'Trainer ledger' },

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
  reasonTooShort: { id: `${scope}.reasonTooShort`, defaultMessage: 'At least 3 characters' },
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
  clearFilters: { id: `${scope}.clearFilters`, defaultMessage: 'Clear filters' },
  noRows: { id: `${scope}.noRows`, defaultMessage: 'Nothing here yet' },
  readOnly: {
    id: `${scope}.readOnly`,
    defaultMessage: 'You can view this. Changing it needs the {permission} permission.',
  },
  session: { id: `${scope}.session`, defaultMessage: 'Session' },
  branch: { id: `${scope}.branch`, defaultMessage: 'Branch' },
  allBranches: { id: `${scope}.allBranches`, defaultMessage: 'All branches' },
  course: { id: `${scope}.course`, defaultMessage: 'Course' },
  training: { id: `${scope}.training`, defaultMessage: 'Training' },
  trainer: { id: `${scope}.trainer`, defaultMessage: 'Trainer' },
  tester: { id: `${scope}.tester`, defaultMessage: 'Tester' },
  rupees: { id: `${scope}.rupees`, defaultMessage: 'Rs {amount}' },
  unassigned: { id: `${scope}.unassigned`, defaultMessage: 'Unassigned' },
  system: { id: `${scope}.system`, defaultMessage: 'System' },
  admin: { id: `${scope}.admin`, defaultMessage: 'Admin' },

  // Enrollment states
  REGISTERED: { id: `${scope}.REGISTERED`, defaultMessage: 'Registered' },
  IN_TRAINING: { id: `${scope}.IN_TRAINING`, defaultMessage: 'In training' },
  READY_FOR_TEST: { id: `${scope}.READY_FOR_TEST`, defaultMessage: 'Ready for test' },
  TESTED: { id: `${scope}.TESTED`, defaultMessage: 'Tested' },
  CLOSED: { id: `${scope}.CLOSED`, defaultMessage: 'Closed' },

  // Closure reasons
  PASSED: { id: `${scope}.PASSED`, defaultMessage: 'Passed' },
  TRAINER_CLOSED: { id: `${scope}.TRAINER_CLOSED`, defaultMessage: 'Closed by trainer' },
  ATTEMPTS_USED: { id: `${scope}.ATTEMPTS_USED`, defaultMessage: 'Attempts used' },
  AUTO_CLOSED: { id: `${scope}.AUTO_CLOSED`, defaultMessage: 'Auto-closed' },
  ADMIN_CLOSED: { id: `${scope}.ADMIN_CLOSED`, defaultMessage: 'Closed by admin' },

  // Decisions
  RETRAIN: { id: `${scope}.RETRAIN`, defaultMessage: 'Retrain' },
  CLOSE: { id: `${scope}.CLOSE`, defaultMessage: 'Close' },
  AUTO_CLOSE: { id: `${scope}.AUTO_CLOSE`, defaultMessage: 'Auto-close' },
  ADMIN_CLOSE: { id: `${scope}.ADMIN_CLOSE`, defaultMessage: 'Closed by admin' },
  REOPEN: { id: `${scope}.REOPEN`, defaultMessage: 'Reopened' },

  // Ledger entry kinds and statuses
  PAYOUT: { id: `${scope}.PAYOUT`, defaultMessage: 'Payout' },
  ADJUSTMENT: { id: `${scope}.ADJUSTMENT`, defaultMessage: 'Adjustment' },
  PAYMENT: { id: `${scope}.PAYMENT`, defaultMessage: 'Payment' },
  PAYABLE: { id: `${scope}.PAYABLE`, defaultMessage: 'Awaiting approval' },
  APPROVED: { id: `${scope}.APPROVED`, defaultMessage: 'Approved' },
  PART_PAID: { id: `${scope}.PART_PAID`, defaultMessage: 'Part paid' },
  PAID: { id: `${scope}.PAID`, defaultMessage: 'Paid' },
  CANCELLED: { id: `${scope}.CANCELLED`, defaultMessage: 'Cancelled' },
  RECORDED: { id: `${scope}.RECORDED`, defaultMessage: 'Recorded' },
  VOIDED: { id: `${scope}.VOIDED`, defaultMessage: 'Voided' },
  PENDING: { id: `${scope}.PENDING`, defaultMessage: 'Pending' },
});
