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
});
