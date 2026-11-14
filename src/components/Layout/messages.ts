/*
 * Layout Messages
 *
 * This contains all the text for the Layout component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.Layout';

export default defineMessages({
  home: {
    id: `${scope}.home`,
    defaultMessage: 'Home',
  },
  admin: {
    id: `${scope}.admin`,
    defaultMessage: 'Admins',
  },
  adminUsers: {
    id: `${scope}.adminUsers`,
    defaultMessage: 'Admins',
  },
  branches: {
    id: `${scope}.branches`,
    defaultMessage: 'Branches',
  },
  students: {
    id: `${scope}.students`,
    defaultMessage: 'Students',
  },
  van: {
    id: `${scope}.van`,
    defaultMessage: 'Vans',
  },
  admissions: {
    id: `${scope}.admissions`,
    defaultMessage: 'Admissions',
  },
  questionSets: {
    id: `${scope}.questionSets`,
    defaultMessage: 'Question Sets',
  },
  adminPermissions: {
    id: `${scope}.adminPermissions`,
    defaultMessage: 'Admin permissions',
  },
  staffUsers: {
    id: `${scope}.staffUsers`,
    defaultMessage: 'Staff app users',
  },
  sections: {
    id: `${scope}.sections`,
    defaultMessage: 'Sections',
  },
  syncReview: {
    id: `${scope}.syncReview`,
    defaultMessage: 'Flagged staff app work',
  },
  results: {
    id: `${scope}.results`,
    defaultMessage: 'Results',
  },
  auditLog: {
    id: `${scope}.auditLog`,
    defaultMessage: 'Audit log',
  },
  printing: {
    id: `${scope}.printing`,
    defaultMessage: 'Printing',
  },
  interactionReport: {
    id: `${scope}.interactionReport`,
    defaultMessage: 'Interactions',
  },
  signOut: {
    id: `${scope}.signOut`,
    defaultMessage: 'Sign Out',
  },
  changePassword: {
    id: `${scope}.changePassword`,
    defaultMessage: 'Change Password',
  },
});
