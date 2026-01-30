/**
 * Admission Messages
 *
 * This contains all the text for the Admission listing component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.view.listing';

export default defineMessages({
  active: {
    id: `${scope}.active`,
    defaultMessage: 'Active',
  },
  inActive: {
    id: `${scope}.inActive`,
    defaultMessage: 'In-Active',
  },
  noData: {
    id: `${scope}.noData`,
    defaultMessage: 'No Admission Found',
  },

  // Update
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Admission updated successfully',
  },
  errorSuccess: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },

  // Header Names
  grNumberColumnName: {
    id: `${scope}.grNumberColumnName`,
    defaultMessage: 'GR Number',
  },
  nameColumnName: {
    id: `${scope}.nameColumnName`,
    defaultMessage: 'Student Name',
  },
  fatherNameColumnName: {
    id: `${scope}.fatherNameColumnName`,
    defaultMessage: 'Father Name',
  },
  phoneColumnName: {
    id: `${scope}.phoneColumnName`,
    defaultMessage: 'Phone',
  },
  statusColumnName: {
    id: `${scope}.statusColumnName`,
    defaultMessage: 'Status',
  },
  classLevelColumnName: {
    id: `${scope}.classLevelColumnName`,
    defaultMessage: 'Class',
  },
  vanColumnName: {
    id: `${scope}.vanColumnName`,
    defaultMessage: 'Van',
  },
  branchColumnName: {
    id: `${scope}.branchColumnName`,
    defaultMessage: 'Branch',
  },
  sessionColumnName: {
    id: `${scope}.sessionColumnName`,
    defaultMessage: 'Session',
  },
  actionsColumnName: {
    id: `${scope}.actionsColumnName`,
    defaultMessage: 'Actions',
  },

  // Filter Labels
  statusFilterLabel: {
    id: `${scope}.statusFilterLabel`,
    defaultMessage: 'Status',
  },
  feePaidFilterLabel: {
    id: `${scope}.feePaidFilterLabel`,
    defaultMessage: 'Fee Status',
  },
  grNumberFilterLabel: {
    id: `${scope}.grNumberFilterLabel`,
    defaultMessage: 'GR Number',
  },
  nameFilterLabel: {
    id: `${scope}.nameFilterLabel`,
    defaultMessage: 'Student Name',
  },
  fatherNameFilterLabel: {
    id: `${scope}.fatherNameFilterLabel`,
    defaultMessage: 'Father Name',
  },
  phoneFilterLabel: {
    id: `${scope}.phoneFilterLabel`,
    defaultMessage: 'Phone',
  },
  applyFilters: {
    id: `${scope}.applyFilters`,
    defaultMessage: 'Search',
  },

  // Action Messages
  printQRCode: {
    id: `${scope}.printQRCode`,
    defaultMessage: 'Print QR',
  },
  markAsPaid: {
    id: `${scope}.markAsPaid`,
    defaultMessage: 'Mark Paid',
  },
  markAsUnpaid: {
    id: `${scope}.markAsUnpaid`,
    defaultMessage: 'Mark Unpaid',
  },
  printVerificationSlip: {
    id: `${scope}.printVerificationSlip`,
    defaultMessage: 'Print Slip',
  },
  printSlip: {
    id: `${scope}.printSlip`,
    defaultMessage: 'Print Slip',
  },
  printing: {
    id: `${scope}.printing`,
    defaultMessage: 'Printing...',
  },
  testPrint: {
    id: `${scope}.testPrint`,
    defaultMessage: 'Test Print',
  },
  testPrinting: {
    id: `${scope}.testPrinting`,
    defaultMessage: 'Opening...',
  },
  updating: {
    id: `${scope}.updating`,
    defaultMessage: 'Updating...',
  },
  feePaidSuccess: {
    id: `${scope}.feePaidSuccess`,
    defaultMessage: 'Fee status updated successfully',
  },
  feePaidError: {
    id: `${scope}.feePaidError`,
    defaultMessage: 'Failed to update fee status',
  },
  feePaidColumnName: {
    id: `${scope}.feePaidColumnName`,
    defaultMessage: 'Fee Paid',
  },
  verify: {
    id: `${scope}.verify`,
    defaultMessage: 'Verify',
  },
});
