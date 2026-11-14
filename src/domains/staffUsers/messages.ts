/*
 * Staff app users: listing, detail, login codes, phones and printable cards
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.staffUsers';

export default defineMessages({
  // Pages
  listingTitle: { id: `${scope}.listingTitle`, defaultMessage: 'Staff app users' },
  detailTitle: { id: `${scope}.detailTitle`, defaultMessage: 'Staff app user' },
  cardsTitle: { id: `${scope}.cardsTitle`, defaultMessage: 'Staff cards' },

  // Listing
  searchLabel: { id: `${scope}.searchLabel`, defaultMessage: 'Name, staff ID or phone' },
  roleFilter: { id: `${scope}.roleFilter`, defaultMessage: 'Role' },
  allRoles: { id: `${scope}.allRoles`, defaultMessage: 'All roles' },
  noStaffUsers: { id: `${scope}.noStaffUsers`, defaultMessage: 'No staff users found' },
  printCards: { id: `${scope}.printCards`, defaultMessage: 'Print cards' },
  printSelectedCards: { id: `${scope}.printSelectedCards`, defaultMessage: 'Print cards ({count})' },
  activePhones: { id: `${scope}.activePhones`, defaultMessage: 'Phones logged in' },

  // Fields
  staffId: { id: `${scope}.staffId`, defaultMessage: 'Staff ID' },
  name: { id: `${scope}.name`, defaultMessage: 'Name' },
  phone: { id: `${scope}.phone`, defaultMessage: 'Phone' },
  roles: { id: `${scope}.roles`, defaultMessage: 'Roles' },
  language: { id: `${scope}.language`, defaultMessage: 'App language' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  active: { id: `${scope}.active`, defaultMessage: 'Active' },
  deactivated: { id: `${scope}.deactivated`, defaultMessage: 'Deactivated' },
  showDeactivated: { id: `${scope}.showDeactivated`, defaultMessage: 'Show deactivated' },
  deactivatedBanner: {
    id: `${scope}.deactivatedBanner`,
    defaultMessage: 'This user is deactivated and can’t log in to the staff app.',
  },
  createdAt: { id: `${scope}.createdAt`, defaultMessage: 'Added' },
  languageUr: { id: `${scope}.languageUr`, defaultMessage: 'Urdu' },
  languageEn: { id: `${scope}.languageEn`, defaultMessage: 'English' },

  // Roles
  roleTEACHER: { id: `${scope}.roleTEACHER`, defaultMessage: 'Teacher' },
  roleTRAINER: { id: `${scope}.roleTRAINER`, defaultMessage: 'Trainer' },
  roleTESTER: { id: `${scope}.roleTESTER`, defaultMessage: 'Tester' },
  roleFEE_DESK: { id: `${scope}.roleFEE_DESK`, defaultMessage: 'Fee desk' },
  roleTEACHERHint: {
    id: `${scope}.roleTEACHERHint`,
    defaultMessage: 'Attendance, exam marks and interviews for their sections',
  },
  roleTRAINERHint: { id: `${scope}.roleTRAINERHint`, defaultMessage: 'Fiqh training' },
  roleTESTERHint: { id: `${scope}.roleTESTERHint`, defaultMessage: 'Fiqh tests' },
  roleFEE_DESKHint: {
    id: `${scope}.roleFEE_DESKHint`,
    defaultMessage: 'Find students, check documents, mark the fee paid, print slips',
  },

  // Actions
  edit: { id: `${scope}.edit`, defaultMessage: 'Edit' },
  issueLoginCode: { id: `${scope}.issueLoginCode`, defaultMessage: 'Issue login code' },
  printCard: { id: `${scope}.printCard`, defaultMessage: 'Print card' },
  deactivate: { id: `${scope}.deactivate`, defaultMessage: 'Deactivate' },
  reactivate: { id: `${scope}.reactivate`, defaultMessage: 'Reactivate' },
  cancel: { id: `${scope}.cancel`, defaultMessage: 'Cancel' },
  done: { id: `${scope}.done`, defaultMessage: 'Done' },
  back: { id: `${scope}.back`, defaultMessage: 'Back' },
  print: { id: `${scope}.print`, defaultMessage: 'Print' },

  // Create and edit
  createTitle: { id: `${scope}.createTitle`, defaultMessage: 'Add a staff app user' },
  editTitle: { id: `${scope}.editTitle`, defaultMessage: 'Edit {name}' },
  staffIdAssigned: {
    id: `${scope}.staffIdAssigned`,
    defaultMessage: 'The staff ID is a random 5-digit number the server picks when you save.',
  },
  rolesRequired: { id: `${scope}.rolesRequired`, defaultMessage: 'Pick at least one role' },
  nameRequired: { id: `${scope}.nameRequired`, defaultMessage: 'Enter the name' },
  phoneInvalid: { id: `${scope}.phoneInvalid`, defaultMessage: 'Enter a valid phone number' },
  created: { id: `${scope}.created`, defaultMessage: 'Added, with staff ID {staffId}' },
  saved: { id: `${scope}.saved`, defaultMessage: 'Saved' },
  saveFailed: { id: `${scope}.saveFailed`, defaultMessage: 'Could not save' },
  loadError: { id: `${scope}.loadError`, defaultMessage: 'Could not load' },
  notFound: { id: `${scope}.notFound`, defaultMessage: 'Staff user not found' },

  // Login code
  loginCode: { id: `${scope}.loginCode`, defaultMessage: 'Login code' },
  loginCodeConfirmTitle: { id: `${scope}.loginCodeConfirmTitle`, defaultMessage: 'Issue a login code to {name}?' },
  loginCodeConfirm: {
    id: `${scope}.loginCodeConfirm`,
    defaultMessage:
      'The code lets one phone log in as {name}. It works for 12 hours and is shown only once. Any earlier code that hasn’t been used stops working.',
  },
  issue: { id: `${scope}.issue`, defaultMessage: 'Issue code' },
  loginCodeShownOnce: {
    id: `${scope}.loginCodeShownOnce`,
    defaultMessage:
      'Give this code to {name} in person. It won’t be shown again; if it’s lost, issue a new one. It is not on the staff card.',
  },
  loginCodeExpires: { id: `${scope}.loginCodeExpires`, defaultMessage: 'Works until {time} (12 hours)' },
  loginCodeHowTo: {
    id: `${scope}.loginCodeHowTo`,
    defaultMessage: 'In the staff app, they enter staff ID {staffId}, then this code.',
  },
  codeNONE: { id: `${scope}.codeNONE`, defaultMessage: 'No code issued yet' },
  codeOPEN: { id: `${scope}.codeOPEN`, defaultMessage: 'Waiting to be used' },
  codeUSED: { id: `${scope}.codeUSED`, defaultMessage: 'Used' },
  codeEXPIRED: { id: `${scope}.codeEXPIRED`, defaultMessage: 'Expired unused' },
  codeLOCKED: { id: `${scope}.codeLOCKED`, defaultMessage: 'Cancelled after too many wrong tries' },
  codeREPLACED: { id: `${scope}.codeREPLACED`, defaultMessage: 'Replaced by a newer code' },
  codeDEACTIVATED: { id: `${scope}.codeDEACTIVATED`, defaultMessage: 'Cancelled when the user was deactivated' },
  codeIssuedAt: { id: `${scope}.codeIssuedAt`, defaultMessage: 'Issued {time}' },
  codeExpiresAt: { id: `${scope}.codeExpiresAt`, defaultMessage: 'expires {time}' },
  codeAttemptsLeft: { id: `${scope}.codeAttemptsLeft`, defaultMessage: 'Wrong tries left: {count}' },
  codeNote: {
    id: `${scope}.codeNote`,
    defaultMessage: 'Codes are shown only when issued. To log in on a new phone, issue a new code.',
  },

  // Phones
  phones: { id: `${scope}.phones`, defaultMessage: 'Phones' },
  noPhones: { id: `${scope}.noPhones`, defaultMessage: 'No phone has logged in yet' },
  phoneLabel: { id: `${scope}.phoneLabel`, defaultMessage: 'Phone' },
  activatedAt: { id: `${scope}.activatedAt`, defaultMessage: 'Logged in' },
  lastSeenAt: { id: `${scope}.lastSeenAt`, defaultMessage: 'Last seen' },
  phoneStatus: { id: `${scope}.phoneStatus`, defaultMessage: 'Status' },
  phoneLoggedIn: { id: `${scope}.phoneLoggedIn`, defaultMessage: 'Logged in' },
  phoneDraining: {
    id: `${scope}.phoneDraining`,
    defaultMessage: 'Logged out {time}; can still send unsent work until {until}',
  },
  phoneLoggedOut: { id: `${scope}.phoneLoggedOut`, defaultMessage: 'Logged out {time}' },
  phoneDiscarded: { id: `${scope}.phoneDiscarded`, defaultMessage: 'Logged out {time}; unsent work discarded' },
  logOut: { id: `${scope}.logOut`, defaultMessage: 'Log out' },
  logOutDiscard: { id: `${scope}.logOutDiscard`, defaultMessage: 'Log out and discard unsent work' },
  logOutAll: { id: `${scope}.logOutAll`, defaultMessage: 'Log out all phones' },
  logOutAllDiscard: { id: `${scope}.logOutAllDiscard`, defaultMessage: 'Log out all and discard' },
  logoutExplainTitle: { id: `${scope}.logoutExplainTitle`, defaultMessage: 'Which log out?' },
  logoutExplain: {
    id: `${scope}.logoutExplain`,
    defaultMessage:
      'Log out: the phone first sends any work it hasn’t sent yet (it has 7 days), then clears itself. Use it when someone changes phone or stops helping.',
  },
  discardExplain: {
    id: `${scope}.discardExplain`,
    defaultMessage:
      'Log out and discard unsent work: the phone clears itself the next time it’s online, and anything it hasn’t sent is lost. Use it only for a lost or stolen phone.',
  },
  logoutTitleOne: { id: `${scope}.logoutTitleOne`, defaultMessage: 'Log out {phone}?' },
  logoutTitleAll: { id: `${scope}.logoutTitleAll`, defaultMessage: 'Log out all of {name}’s phones?' },
  discardTitleOne: { id: `${scope}.discardTitleOne`, defaultMessage: 'Log out {phone} and discard its unsent work?' },
  discardTitleAll: {
    id: `${scope}.discardTitleAll`,
    defaultMessage: 'Log out all of {name}’s phones and discard their unsent work?',
  },
  discardWarning: {
    id: `${scope}.discardWarning`,
    defaultMessage: 'Attendance or marks on the phone that haven’t been sent will be lost. This can’t be undone.',
  },
  reasonOptional: { id: `${scope}.reasonOptional`, defaultMessage: 'Reason (optional, for the audit log)' },
  loggedOut: { id: `${scope}.loggedOut`, defaultMessage: 'Phones logged out: {count}' },
  loggedOutDiscarded: {
    id: `${scope}.loggedOutDiscarded`,
    defaultMessage: 'Phones logged out: {count}. Unsent work discarded on: {discarded}',
  },

  // Deactivate and reactivate
  deactivateTitle: { id: `${scope}.deactivateTitle`, defaultMessage: 'Deactivate {name}?' },
  deactivateExplain: {
    id: `${scope}.deactivateExplain`,
    defaultMessage:
      'They can’t log in, every phone is logged out, and any open login code stops working. Their phones still send unsent work first, unless you tick the box below.',
  },
  deactivateDiscard: {
    id: `${scope}.deactivateDiscard`,
    defaultMessage: 'Also discard unsent work (a lost or stolen phone)',
  },
  reactivateTitle: { id: `${scope}.reactivateTitle`, defaultMessage: 'Reactivate {name}?' },
  reactivateExplain: {
    id: `${scope}.reactivateExplain`,
    defaultMessage: 'Their phones stay logged out. Issue a new login code so they can log in again.',
  },

  // Cards
  cardsIntro: {
    id: `${scope}.cardsIntro`,
    defaultMessage:
      'Cards are credit-card size (CR80), 10 to an A4 sheet. Print at 100% (actual size), then cut along the lines. The QR code holds only the staff ID.',
  },
  cardsCount: { id: `${scope}.cardsCount`, defaultMessage: 'Cards: {count} · A4 sheets: {pages}' },
  cardsNone: { id: `${scope}.cardsNone`, defaultMessage: 'No active staff users to print' },
  cardsInactiveSkipped: {
    id: `${scope}.cardsInactiveSkipped`,
    defaultMessage: 'Deactivated users are left out.',
  },
  cardStaff: { id: `${scope}.cardStaff`, defaultMessage: 'Staff' },
});
