/*
 * Admin permissions: who may do what in the portal
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.adminPermissions';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Admin permissions' },
  intro: {
    id: `${scope}.intro`,
    defaultMessage:
      'Super admins can do everything through their role. Other admins can only do what is ticked here. Every change is recorded in the audit log with your name and reason.',
  },
  search: { id: `${scope}.search`, defaultMessage: 'Find an admin' },
  showDeactivated: { id: `${scope}.showDeactivated`, defaultMessage: 'Show deactivated admins' },
  noAdmins: { id: `${scope}.noAdmins`, defaultMessage: 'No admins found' },
  pickAdmin: { id: `${scope}.pickAdmin`, defaultMessage: 'Pick an admin to see their permissions.' },
  permissionCount: {
    id: `${scope}.permissionCount`,
    defaultMessage: '{count, plural, =0 {No permissions} one {# permission} other {# permissions}}',
  },
  allPermissions: { id: `${scope}.allPermissions`, defaultMessage: 'All permissions' },
  deactivated: { id: `${scope}.deactivated`, defaultMessage: 'Deactivated' },
  loadFailed: { id: `${scope}.loadFailed`, defaultMessage: 'Couldn’t load the admins.' },

  // Roles
  roleSUPER_ADMIN: { id: `${scope}.roleSUPER_ADMIN`, defaultMessage: 'Super admin' },
  roleADMIN: { id: `${scope}.roleADMIN`, defaultMessage: 'Admin' },
  roleTEACHER: { id: `${scope}.roleTEACHER`, defaultMessage: 'Teacher' },

  // Panel
  superAdminNote: {
    id: `${scope}.superAdminNote`,
    defaultMessage: 'Super admins have every permission through their role, so there is nothing to grant here.',
  },
  deactivatedNote: {
    id: `${scope}.deactivatedNote`,
    defaultMessage: 'This admin is deactivated and can’t sign in. Their permissions are kept in case they come back.',
  },
  fromRole: { id: `${scope}.fromRole`, defaultMessage: 'From role' },
  grantedBy: { id: `${scope}.grantedBy`, defaultMessage: 'Granted by {name} on {date}' },
  grantedOn: { id: `${scope}.grantedOn`, defaultMessage: 'Granted on {date}' },
  willGrant: { id: `${scope}.willGrant`, defaultMessage: 'Will be granted' },
  willRemove: { id: `${scope}.willRemove`, defaultMessage: 'Will be removed' },
  changes: {
    id: `${scope}.changes`,
    defaultMessage: '{count, plural, one {# change not saved} other {# changes not saved}}',
  },
  discard: { id: `${scope}.discard`, defaultMessage: 'Discard' },
  save: { id: `${scope}.save`, defaultMessage: 'Save changes' },
  history: { id: `${scope}.history`, defaultMessage: 'See changes in the audit log' },

  // Save dialog
  saveTitle: { id: `${scope}.saveTitle`, defaultMessage: 'Change permissions for {name}' },
  granting: { id: `${scope}.granting`, defaultMessage: 'Grant' },
  removing: { id: `${scope}.removing`, defaultMessage: 'Remove' },
  reason: { id: `${scope}.reason`, defaultMessage: 'Reason (kept in the audit log)' },
  reasonRequired: { id: `${scope}.reasonRequired`, defaultMessage: 'Write why, for the audit log' },
  saved: { id: `${scope}.saved`, defaultMessage: 'Permissions saved' },
  saveFailed: { id: `${scope}.saveFailed`, defaultMessage: 'Couldn’t save the permissions' },

  // Groups
  groupStudents: { id: `${scope}.groupStudents`, defaultMessage: 'Students' },
  groupSections: { id: `${scope}.groupSections`, defaultMessage: 'Sections and staff' },
  groupResults: { id: `${scope}.groupResults`, defaultMessage: 'Results' },
  groupTrainings: { id: `${scope}.groupTrainings`, defaultMessage: 'Fiqh trainings' },
  groupReports: { id: `${scope}.groupReports`, defaultMessage: 'Reports and audit' },
  groupOther: { id: `${scope}.groupOther`, defaultMessage: 'Other' },

  // Permissions: a short name and what it lets the admin do
  p_students_editIdentity: { id: `${scope}.p_students_editIdentity`, defaultMessage: 'Edit student identity' },
  p_students_editIdentity_hint: {
    id: `${scope}.p_students_editIdentity_hint`,
    defaultMessage: 'Change a student’s name, father’s name, birth date, B-form number and GR number.',
  },
  p_students_merge: { id: `${scope}.p_students_merge`, defaultMessage: 'Merge students' },
  p_students_merge_hint: {
    id: `${scope}.p_students_merge_hint`,
    defaultMessage:
      'Merge duplicate student records into one, link students to their 2025 record, and undo these changes.',
  },
  p_sections_manage: { id: `${scope}.p_sections_manage`, defaultMessage: 'Manage sections' },
  p_sections_manage_hint: {
    id: `${scope}.p_sections_manage_hint`,
    defaultMessage: 'Create sections, assign teachers, place and move students, and change a student’s class.',
  },
  p_staff_manage: { id: `${scope}.p_staff_manage`, defaultMessage: 'Manage staff app users' },
  p_staff_manage_hint: {
    id: `${scope}.p_staff_manage_hint`,
    defaultMessage: 'Add and deactivate staff app users, give them login codes, and log out their phones.',
  },
  p_staff_review: { id: `${scope}.p_staff_review`, defaultMessage: 'Review flagged staff app work' },
  p_staff_review_hint: {
    id: `${scope}.p_staff_review_hint`,
    defaultMessage: 'Check work a phone sent after it was logged out, or attendance marked for an earlier day.',
  },
  p_results_enter: { id: `${scope}.p_results_enter`, defaultMessage: 'Enter results' },
  p_results_enter_hint: {
    id: `${scope}.p_results_enter_hint`,
    defaultMessage: 'Enter and correct results that aren’t locked yet.',
  },
  p_results_lock: { id: `${scope}.p_results_lock`, defaultMessage: 'Lock results and work out positions' },
  p_results_lock_hint: {
    id: `${scope}.p_results_lock_hint`,
    defaultMessage: 'Lock and unlock results so nobody changes them, and work out positions.',
  },
  p_results_override: { id: `${scope}.p_results_override`, defaultMessage: 'Change locked results and import' },
  p_results_override_hint: {
    id: `${scope}.p_results_override_hint`,
    defaultMessage: 'Change results that are locked, and import results for many students from a sheet.',
  },
  p_trainings_configure: { id: `${scope}.p_trainings_configure`, defaultMessage: 'Set up trainings' },
  p_trainings_configure_hint: {
    id: `${scope}.p_trainings_configure_hint`,
    defaultMessage: 'Choose the trainings, the age each starts at, their pass marks and the trainers’ pay.',
  },
  p_trainings_manage: { id: `${scope}.p_trainings_manage`, defaultMessage: 'Run trainings' },
  p_trainings_manage_hint: {
    id: `${scope}.p_trainings_manage_hint`,
    defaultMessage:
      'Open testing windows, enroll students, assign and change trainers and testers, close enrollments, and record passes.',
  },
  p_trainings_override: { id: `${scope}.p_trainings_override`, defaultMessage: 'Change training test marks' },
  p_trainings_override_hint: {
    id: `${scope}.p_trainings_override_hint`,
    defaultMessage: 'Change test marks after a tester has sent them, with a reason.',
  },
  p_trainings_payouts: { id: `${scope}.p_trainings_payouts`, defaultMessage: 'Trainer payments' },
  p_trainings_payouts_hint: {
    id: `${scope}.p_trainings_payouts_hint`,
    defaultMessage: 'Approve what trainers have earned, and record payments to them.',
  },
  p_reports_view: { id: `${scope}.p_reports_view`, defaultMessage: 'See reports and results' },
  p_reports_view_hint: {
    id: `${scope}.p_reports_view_hint`,
    defaultMessage: 'Open reports and results tables, without changing anything.',
  },
  p_reports_chat: { id: `${scope}.p_reports_chat`, defaultMessage: 'Planning chat' },
  p_reports_chat_hint: {
    id: `${scope}.p_reports_chat_hint`,
    defaultMessage: 'Ask the planning chat questions about the program’s totals and reports.',
  },
  p_audit_view: { id: `${scope}.p_audit_view`, defaultMessage: 'Read the audit log' },
  p_audit_view_hint: {
    id: `${scope}.p_audit_view_hint`,
    defaultMessage: 'See who changed what and when, with the reason they gave.',
  },
});
