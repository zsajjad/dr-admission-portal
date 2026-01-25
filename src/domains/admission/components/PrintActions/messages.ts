/*
 * PrintActions Messages
 *
 * This contains all the text for the PrintActions component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.components.PrintActions';

export default defineMessages({
  printIdCard: {
    id: `${scope}.printIdCard`,
    defaultMessage: 'Print ID Card',
  },
  printVerificationSlip: {
    id: `${scope}.printVerificationSlip`,
    defaultMessage: 'Print Verification Slip',
  },
  printing: {
    id: `${scope}.printing`,
    defaultMessage: 'Printing...',
  },
  printSuccess: {
    id: `${scope}.printSuccess`,
    defaultMessage: 'Document generated successfully',
  },
  printError: {
    id: `${scope}.printError`,
    defaultMessage: 'Failed to generate document',
  },
});
