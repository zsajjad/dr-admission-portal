/*
 * Printing Components Messages
 *
 * This contains all the text for the Printing components.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.printing.components';

export default defineMessages({
  pageTitle: {
    id: `${scope}.pageTitle`,
    defaultMessage: 'Printing',
  },
  idCards: {
    id: `${scope}.idCards`,
    defaultMessage: 'ID Cards',
  },
  sittingSlips: {
    id: `${scope}.sittingSlips`,
    defaultMessage: 'Sitting Slips',
  },
  attendanceSheets: {
    id: `${scope}.attendanceSheets`,
    defaultMessage: 'Attendance Sheets',
  },
  verificationSlips: {
    id: `${scope}.verificationSlips`,
    defaultMessage: 'Verification Slips',
  },
  cardRequests: {
    id: `${scope}.cardRequests`,
    defaultMessage: 'Card Requests',
  },
  generate: {
    id: `${scope}.generate`,
    defaultMessage: 'Generate',
  },
  previewDesign: {
    id: `${scope}.previewDesign`,
    defaultMessage: 'Preview Design',
  },
  generating: {
    id: `${scope}.generating`,
    defaultMessage: 'Generating...',
  },
  sessionRequired: {
    id: `${scope}.sessionRequired`,
    defaultMessage: 'Please select a session',
  },
  areaRequired: {
    id: `${scope}.areaRequired`,
    defaultMessage: 'Please select an area',
  },
  noData: {
    id: `${scope}.noData`,
    defaultMessage: 'No data found with current filters',
  },
  studentsFound: {
    id: `${scope}.studentsFound`,
    defaultMessage: '{count} students found',
  },
  generateSuccess: {
    id: `${scope}.generateSuccess`,
    defaultMessage: 'File generated and downloaded successfully',
  },
  generateError: {
    id: `${scope}.generateError`,
    defaultMessage: 'Failed to generate file',
  },
  // Card Print Request Messages
  cardRequestsFound: {
    id: `${scope}.cardRequestsFound`,
    defaultMessage: '{count} card requests found',
  },
  pendingRequests: {
    id: `${scope}.pendingRequests`,
    defaultMessage: 'Pending: {count}',
  },
  completedRequests: {
    id: `${scope}.completedRequests`,
    defaultMessage: 'Completed: {count}',
  },
  cancelledRequests: {
    id: `${scope}.cancelledRequests`,
    defaultMessage: 'Cancelled: {count}',
  },
  processSelected: {
    id: `${scope}.processSelected`,
    defaultMessage: 'Process Selected',
  },
  processAll: {
    id: `${scope}.processAll`,
    defaultMessage: 'Process All Pending',
  },
  processing: {
    id: `${scope}.processing`,
    defaultMessage: 'Processing...',
  },
  processSuccess: {
    id: `${scope}.processSuccess`,
    defaultMessage: '{count} cards generated successfully (Batch: {batchId})',
  },
  processError: {
    id: `${scope}.processError`,
    defaultMessage: 'Failed to process card requests',
  },
  cancelRequest: {
    id: `${scope}.cancelRequest`,
    defaultMessage: 'Cancel',
  },
  cancelSuccess: {
    id: `${scope}.cancelSuccess`,
    defaultMessage: 'Card request cancelled successfully',
  },
  cancelError: {
    id: `${scope}.cancelError`,
    defaultMessage: 'Failed to cancel card request',
  },
  statusPending: {
    id: `${scope}.statusPending`,
    defaultMessage: 'Pending',
  },
  statusCompleted: {
    id: `${scope}.statusCompleted`,
    defaultMessage: 'Completed',
  },
  statusCancelled: {
    id: `${scope}.statusCancelled`,
    defaultMessage: 'Cancelled',
  },
  requestedAt: {
    id: `${scope}.requestedAt`,
    defaultMessage: 'Requested At',
  },
  requestedBy: {
    id: `${scope}.requestedBy`,
    defaultMessage: 'Requested By',
  },
  completedAt: {
    id: `${scope}.completedAt`,
    defaultMessage: 'Completed At',
  },
  completedBy: {
    id: `${scope}.completedBy`,
    defaultMessage: 'Completed By',
  },
  batchId: {
    id: `${scope}.batchId`,
    defaultMessage: 'Batch ID',
  },
  actions: {
    id: `${scope}.actions`,
    defaultMessage: 'Actions',
  },
  statusFilter: {
    id: `${scope}.statusFilter`,
    defaultMessage: 'Status',
  },
  allStatuses: {
    id: `${scope}.allStatuses`,
    defaultMessage: 'All Statuses',
  },
  noPendingRequests: {
    id: `${scope}.noPendingRequests`,
    defaultMessage: 'No pending card requests found',
  },
  selectSessionAndBranch: {
    id: `${scope}.selectSessionAndBranch`,
    defaultMessage: 'Please select a session and branch to view card requests',
  },
});
