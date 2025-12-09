/*
 * Question Set Detail Messages
 *
 * This contains all the text for the Question Set component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.questions.view.detail';

export default defineMessages({
  // Labels
  idLabel: {
    id: `${scope}.idLabel`,
    defaultMessage: 'ID',
  },
  titleLabel: {
    id: `${scope}.titleLabel`,
    defaultMessage: 'Title',
  },
  classLevelLabel: {
    id: `${scope}.classLevelLabel`,
    defaultMessage: 'Class Level',
  },
  sessionLabel: {
    id: `${scope}.sessionLabel`,
    defaultMessage: 'Session',
  },
  questionsLabel: {
    id: `${scope}.questionsLabel`,
    defaultMessage: 'Questions',
  },
  questionsCountLabel: {
    id: `${scope}.questionsCountLabel`,
    defaultMessage: 'Total Questions',
  },
  promptLabel: {
    id: `${scope}.promptLabel`,
    defaultMessage: 'Prompt',
  },
  sortOrderLabel: {
    id: `${scope}.sortOrderLabel`,
    defaultMessage: 'Order',
  },

  // Status messages
  failToFetch: {
    id: `${scope}.failToFetch`,
    defaultMessage: 'Failed to fetch question set details',
  },
  notFound: {
    id: `${scope}.notFound`,
    defaultMessage: 'Question Set Not Found',
  },
  activate: {
    id: `${scope}.activate`,
    defaultMessage: 'Activate',
  },
  deactivate: {
    id: `${scope}.deactivate`,
    defaultMessage: 'Deactivate',
  },
  successUpdate: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Question Set updated successfully',
  },
  errorUpdate: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },
  noQuestions: {
    id: `${scope}.noQuestions`,
    defaultMessage: 'No questions in this set',
  },
});
