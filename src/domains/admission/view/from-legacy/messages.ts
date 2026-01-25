/*
 * Legacy Admission Messages
 *
 * This contains all the text for the Legacy Admission view component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.view.fromLegacy';

export default defineMessages({
  pageTitle: {
    id: `${scope}.pageTitle`,
    defaultMessage: 'Admission from Legacy Data',
  },

  // Search section
  searchTitle: {
    id: `${scope}.searchTitle`,
    defaultMessage: 'Search Legacy Students',
  },
  searchPlaceholder: {
    id: `${scope}.searchPlaceholder`,
    defaultMessage: 'Enter phone number to search',
  },
  searchButton: {
    id: `${scope}.searchButton`,
    defaultMessage: 'Search',
  },
  searchHelperText: {
    id: `${scope}.searchHelperText`,
    defaultMessage: 'Search by phone number, GR number, name, or father name',
  },

  // Results section
  resultsTitle: {
    id: `${scope}.resultsTitle`,
    defaultMessage: 'Search Results',
  },
  noResultsFound: {
    id: `${scope}.noResultsFound`,
    defaultMessage: 'No legacy students found',
  },
  noSearchPerformed: {
    id: `${scope}.noSearchPerformed`,
    defaultMessage: 'Enter a search query to find legacy students',
  },

  // Table columns
  grNumberColumn: {
    id: `${scope}.grNumberColumn`,
    defaultMessage: 'GR Number',
  },
  nameColumn: {
    id: `${scope}.nameColumn`,
    defaultMessage: 'Name',
  },
  fatherNameColumn: {
    id: `${scope}.fatherNameColumn`,
    defaultMessage: 'Father Name',
  },
  phoneColumn: {
    id: `${scope}.phoneColumn`,
    defaultMessage: 'Phone',
  },
  genderColumn: {
    id: `${scope}.genderColumn`,
    defaultMessage: 'Gender',
  },
  statusColumn: {
    id: `${scope}.statusColumn`,
    defaultMessage: 'Status',
  },
  actionsColumn: {
    id: `${scope}.actionsColumn`,
    defaultMessage: 'Actions',
  },

  // Status badges
  alreadyRegistered: {
    id: `${scope}.alreadyRegistered`,
    defaultMessage: 'Already Registered',
  },
  notRegistered: {
    id: `${scope}.notRegistered`,
    defaultMessage: 'Not Registered',
  },

  // Actions
  createAdmission: {
    id: `${scope}.createAdmission`,
    defaultMessage: 'Create Admission',
  },
  viewDetails: {
    id: `${scope}.viewDetails`,
    defaultMessage: 'View Details',
  },

  // Dialog
  createAdmissionTitle: {
    id: `${scope}.createAdmissionTitle`,
    defaultMessage: 'Create Admission from Legacy Data',
  },
  createAdmissionDescription: {
    id: `${scope}.createAdmissionDescription`,
    defaultMessage: 'Review the pre-filled data and complete any missing fields to create the admission.',
  },
  cancel: {
    id: `${scope}.cancel`,
    defaultMessage: 'Cancel',
  },
  create: {
    id: `${scope}.create`,
    defaultMessage: 'Create Admission',
  },
  creating: {
    id: `${scope}.creating`,
    defaultMessage: 'Creating...',
  },

  // Form sections
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

  // Form fields (reuse some from form messages, add new ones)
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

  // Gender options
  male: {
    id: `${scope}.male`,
    defaultMessage: 'Male',
  },
  female: {
    id: `${scope}.female`,
    defaultMessage: 'Female',
  },

  // Validation errors
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

  // Placeholders
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
  addressPlaceholder: {
    id: `${scope}.addressPlaceholder`,
    defaultMessage: 'Enter address',
  },
  identityNumberPlaceholder: {
    id: `${scope}.identityNumberPlaceholder`,
    defaultMessage: 'Enter identity number',
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

  // Success/Error messages
  createSuccess: {
    id: `${scope}.createSuccess`,
    defaultMessage: 'Admission created successfully',
  },
  createError: {
    id: `${scope}.createError`,
    defaultMessage: 'Failed to create admission. Please try again.',
  },

  // Warnings section
  warningsTitle: {
    id: `${scope}.warningsTitle`,
    defaultMessage: 'Data Warnings',
  },
  warningsDescription: {
    id: `${scope}.warningsDescription`,
    defaultMessage: 'The following issues were detected during data prefill:',
  },

  // Raw data section
  rawDataTitle: {
    id: `${scope}.rawDataTitle`,
    defaultMessage: 'Legacy Data',
  },
  legacyArea: {
    id: `${scope}.legacyArea`,
    defaultMessage: 'Area Code',
  },
  legacyCity: {
    id: `${scope}.legacyCity`,
    defaultMessage: 'City',
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
