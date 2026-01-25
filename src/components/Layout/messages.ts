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
  signOut: {
    id: `${scope}.signOut`,
    defaultMessage: 'Sign Out',
  },
  changePassword: {
    id: `${scope}.changePassword`,
    defaultMessage: 'Change Password',
  },
});
