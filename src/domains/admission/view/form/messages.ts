/*
 * Admission Messages
 *
 * This contains all the text for the Admission Form component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.view.form';

export default defineMessages({
  create: {
    id: `${scope}.create`,
    defaultMessage: 'Create New Admission',
  },
  saving: {
    id: `${scope}.saving`,
    defaultMessage: 'Saving...',
  },
  update: {
    id: `${scope}.update`,
    defaultMessage: 'Update',
  },

  // Section headings
  studentInfoSection: {
    id: `${scope}.studentInfoSection`,
    defaultMessage: 'Student Information',
  },
  admissionInfoSection: {
    id: `${scope}.admissionInfoSection`,
    defaultMessage: 'Admission Information',
  },
  additionalInfoSection: {
    id: `${scope}.additionalInfoSection`,
    defaultMessage: 'Additional Information',
  },

  // Fields Error Messages
  nameRequiredError: {
    id: `${scope}.nameRequiredError`,
    defaultMessage: 'Student name is required',
  },
  fatherNameRequiredError: {
    id: `${scope}.fatherNameRequiredError`,
    defaultMessage: 'Father name is required',
  },
  phoneRequiredError: {
    id: `${scope}.phoneRequiredError`,
    defaultMessage: 'Phone is required',
  },
  dateOfBirthRequiredError: {
    id: `${scope}.dateOfBirthRequiredError`,
    defaultMessage: 'Date of birth is required',
  },
  genderRequiredError: {
    id: `${scope}.genderRequiredError`,
    defaultMessage: 'Gender is required',
  },
  branchRequiredError: {
    id: `${scope}.branchRequiredError`,
    defaultMessage: 'Branch is required',
  },
  areaRequiredError: {
    id: `${scope}.areaRequiredError`,
    defaultMessage: 'Area is required',
  },
  sessionRequiredError: {
    id: `${scope}.sessionRequiredError`,
    defaultMessage: 'Session is required',
  },

  //labels
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
    defaultMessage: 'Identity Number (B-Form/CNIC)',
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

  //placeholder
  namePlaceholder: {
    id: `${scope}.namePlaceholder`,
    defaultMessage: 'Enter student name',
  },
  fatherNamePlaceholder: {
    id: `${scope}.fatherNamePlaceholder`,
    defaultMessage: 'Enter father name',
  },
  phonePlaceholder: {
    id: `${scope}.phonePlaceholder`,
    defaultMessage: 'Enter phone number',
  },
  alternatePhonePlaceholder: {
    id: `${scope}.alternatePhonePlaceholder`,
    defaultMessage: 'Enter alternate phone number',
  },
  dateOfBirthPlaceholder: {
    id: `${scope}.dateOfBirthPlaceholder`,
    defaultMessage: 'Select date of birth',
  },
  genderPlaceholder: {
    id: `${scope}.genderPlaceholder`,
    defaultMessage: 'Select gender',
  },
  addressPlaceholder: {
    id: `${scope}.addressPlaceholder`,
    defaultMessage: 'Enter address',
  },
  identityNumberPlaceholder: {
    id: `${scope}.identityNumberPlaceholder`,
    defaultMessage: 'Enter identity number',
  },
  branchPlaceholder: {
    id: `${scope}.branchPlaceholder`,
    defaultMessage: 'Select branch',
  },
  areaPlaceholder: {
    id: `${scope}.areaPlaceholder`,
    defaultMessage: 'Select area',
  },
  sessionPlaceholder: {
    id: `${scope}.sessionPlaceholder`,
    defaultMessage: 'Select session',
  },
  schoolNamePlaceholder: {
    id: `${scope}.schoolNamePlaceholder`,
    defaultMessage: 'Enter school name',
  },
  schoolClassPlaceholder: {
    id: `${scope}.schoolClassPlaceholder`,
    defaultMessage: 'Enter school class',
  },
  lastYearClassPlaceholder: {
    id: `${scope}.lastYearClassPlaceholder`,
    defaultMessage: 'Enter last year class',
  },

  // Gender options
  male: {
    id: `${scope}.male`,
    defaultMessage: 'Male',
  },
  female: {
    id: `${scope}.female`,
    defaultMessage: 'Female',
  },

  // Success messages
  saveSuccess: {
    id: `${scope}.saveSuccess`,
    defaultMessage: 'Admission saved successfully',
  },

  // Error messages
  saveError: {
    id: `${scope}.saveError`,
    defaultMessage: 'Failed to save admission. Please try again.',
  },
  failedToFetch: {
    id: `${scope}.failedToFetch`,
    defaultMessage: 'Failed to fetch admission',
  },

  // Asset uploader
  identityProofLabel: {
    id: `${scope}.identityProofLabel`,
    defaultMessage: 'Identity Proof (B-Form/CNIC)',
  },
  identityProofHelperText: {
    id: `${scope}.identityProofHelperText`,
    defaultMessage: 'Upload a scanned copy of B-Form or CNIC',
  },
});
