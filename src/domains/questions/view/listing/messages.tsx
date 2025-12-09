/*
 * Questions Listing Messages
 *
 * This contains all the text for the Questions listing components.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.questions.view.listing';

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
    defaultMessage: 'No Question Sets Found',
  },

  // Update
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Question Set updated successfully',
  },
  errorSuccess: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },

  // Header Names
  titleHeaderName: {
    id: `${scope}.titleHeaderName`,
    defaultMessage: 'Title',
  },
  classLevelHeaderName: {
    id: `${scope}.classLevelHeaderName`,
    defaultMessage: 'Class Level',
  },
  sessionHeaderName: {
    id: `${scope}.sessionHeaderName`,
    defaultMessage: 'Session',
  },
  questionsCountHeaderName: {
    id: `${scope}.questionsCountHeaderName`,
    defaultMessage: 'Questions',
  },
  actionsHeaderName: {
    id: `${scope}.actionsHeaderName`,
    defaultMessage: 'Actions',
  },
});
