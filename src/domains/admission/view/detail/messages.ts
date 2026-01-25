/*
 * Admission Messages
 *
 * This contains all the text for the admission detail component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.view.detail';

export default defineMessages({
  //labels
  idLabel: {
    id: `${scope}.idLabel`,
    defaultMessage: 'ID',
  },
  grNumberLabel: {
    id: `${scope}.grNumberLabel`,
    defaultMessage: 'GR Number',
  },
  nameLabel: {
    id: `${scope}.nameLabel`,
    defaultMessage: 'Student Name',
  },
  fatherNameLabel: {
    id: `${scope}.fatherNameLabel`,
    defaultMessage: 'Father Name',
  },
  phoneLabel: {
    id: `${scope}.phoneLabel`,
    defaultMessage: 'Phone',
  },
  alternatePhoneLabel: {
    id: `${scope}.alternatePhoneLabel`,
    defaultMessage: 'Alternate Phone',
  },
  dateOfBirthLabel: {
    id: `${scope}.dateOfBirthLabel`,
    defaultMessage: 'Date of Birth',
  },
  genderLabel: {
    id: `${scope}.genderLabel`,
    defaultMessage: 'Gender',
  },
  addressLabel: {
    id: `${scope}.addressLabel`,
    defaultMessage: 'Address',
  },
  identityNumberLabel: {
    id: `${scope}.identityNumberLabel`,
    defaultMessage: 'Identity Number',
  },
  branchLabel: {
    id: `${scope}.branchLabel`,
    defaultMessage: 'Branch',
  },
  areaLabel: {
    id: `${scope}.areaLabel`,
    defaultMessage: 'Area',
  },
  sessionLabel: {
    id: `${scope}.sessionLabel`,
    defaultMessage: 'Session',
  },
  classLevelLabel: {
    id: `${scope}.classLevelLabel`,
    defaultMessage: 'Class Level',
  },
  statusLabel: {
    id: `${scope}.statusLabel`,
    defaultMessage: 'Status',
  },
  schoolNameLabel: {
    id: `${scope}.schoolNameLabel`,
    defaultMessage: 'School Name',
  },
  schoolClassLabel: {
    id: `${scope}.schoolClassLabel`,
    defaultMessage: 'School Class',
  },
  lastYearClassLabel: {
    id: `${scope}.lastYearClassLabel`,
    defaultMessage: 'Last Year Class',
  },
  vanRequiredLabel: {
    id: `${scope}.vanRequiredLabel`,
    defaultMessage: 'Van Required',
  },
  isMarriedLabel: {
    id: `${scope}.isMarriedLabel`,
    defaultMessage: 'Is Married',
  },
  isWorkingLabel: {
    id: `${scope}.isWorkingLabel`,
    defaultMessage: 'Is Working',
  },
  isFinalizedLabel: {
    id: `${scope}.isFinalizedLabel`,
    defaultMessage: 'Is Finalized',
  },
  isFeePaidLabel: {
    id: `${scope}.isFeePaidLabel`,
    defaultMessage: 'Fee Paid',
  },
  studentInfoLabel: {
    id: `${scope}.studentInfoLabel`,
    defaultMessage: 'Student Information',
  },
  admissionInfoLabel: {
    id: `${scope}.admissionInfoLabel`,
    defaultMessage: 'Admission Information',
  },
  additionalInfoLabel: {
    id: `${scope}.additionalInfoLabel`,
    defaultMessage: 'Additional Information',
  },
  vanInfoLabel: {
    id: `${scope}.vanInfoLabel`,
    defaultMessage: 'Van Information',
  },
  vanLabel: {
    id: `${scope}.vanLabel`,
    defaultMessage: 'Assigned Van',
  },
  yes: {
    id: `${scope}.yes`,
    defaultMessage: 'Yes',
  },
  no: {
    id: `${scope}.no`,
    defaultMessage: 'No',
  },

  // Error messages
  failToFetch: {
    id: `${scope}.failToFetch`,
    defaultMessage: 'Failed to fetch Admission details',
  },
  notFound: {
    id: `${scope}.notFound`,
    defaultMessage: 'Admission Detail Not Found',
  },
  successUpdate: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Admission updated successfully',
  },
  errorUpdate: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },
});
