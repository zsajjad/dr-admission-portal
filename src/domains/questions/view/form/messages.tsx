/*
 * Question Set Form Messages
 *
 * This contains all the text for the Question Set form component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.questions.view.form';

export default defineMessages({
  create: {
    id: `${scope}.create`,
    defaultMessage: 'Create New Question Set',
  },
  edit: {
    id: `${scope}.edit`,
    defaultMessage: 'Edit Question Set',
  },
  cancel: {
    id: `${scope}.cancel`,
    defaultMessage: 'Cancel',
  },
  save: {
    id: `${scope}.save`,
    defaultMessage: 'Save Question Set',
  },
  saving: {
    id: `${scope}.saving`,
    defaultMessage: 'Saving...',
  },
  update: {
    id: `${scope}.update`,
    defaultMessage: 'Update Question Set',
  },

  // Field error messages
  titleError: {
    id: `${scope}.titleRequired`,
    defaultMessage: 'Title is required',
  },
  sessionError: {
    id: `${scope}.sessionRequired`,
    defaultMessage: 'Session is required',
  },
  classLevelError: {
    id: `${scope}.classLevelRequired`,
    defaultMessage: 'Class Level is required',
  },
  questionsError: {
    id: `${scope}.questionsRequired`,
    defaultMessage: 'At least one question is required',
  },
  promptError: {
    id: `${scope}.promptRequired`,
    defaultMessage: 'Question prompt is required',
  },

  // Labels
  titleLabel: {
    id: `${scope}.titleLabel`,
    defaultMessage: 'Title',
  },
  sessionLabel: {
    id: `${scope}.sessionLabel`,
    defaultMessage: 'Session',
  },
  classLevelLabel: {
    id: `${scope}.classLevelLabel`,
    defaultMessage: 'Class Level',
  },
  questionsLabel: {
    id: `${scope}.questionsLabel`,
    defaultMessage: 'Questions',
  },
  promptLabel: {
    id: `${scope}.promptLabel`,
    defaultMessage: 'Question Prompt',
  },

  // Placeholders
  titlePlaceholder: {
    id: `${scope}.titlePlaceholder`,
    defaultMessage: 'Enter title',
  },
  sessionPlaceholder: {
    id: `${scope}.sessionPlaceholder`,
    defaultMessage: 'Select session',
  },
  classLevelPlaceholder: {
    id: `${scope}.classLevelPlaceholder`,
    defaultMessage: 'Select class level',
  },
  promptPlaceholder: {
    id: `${scope}.promptPlaceholder`,
    defaultMessage: 'Enter question prompt',
  },

  // Actions
  addQuestion: {
    id: `${scope}.addQuestion`,
    defaultMessage: 'Add Question',
  },
  removeQuestion: {
    id: `${scope}.removeQuestion`,
    defaultMessage: 'Remove',
  },

  // Success messages
  saveSuccess: {
    id: `${scope}.saveSuccess`,
    defaultMessage: 'Question Set saved successfully',
  },
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Question Set updated successfully',
  },

  // Error messages
  saveError: {
    id: `${scope}.saveError`,
    defaultMessage: 'Failed to save question set. Please try again.',
  },
  updateError: {
    id: `${scope}.updateError`,
    defaultMessage: 'Failed to update question set. Please try again.',
  },
  generalError: {
    id: `${scope}.generalError`,
    defaultMessage: 'An error occurred. Please try again.',
  },
  failedToFetch: {
    id: `${scope}.failedToFetch`,
    defaultMessage: 'Failed to fetch question set',
  },
  failedToFetchSessions: {
    id: `${scope}.failedToFetchSessions`,
    defaultMessage: 'Failed to fetch sessions',
  },
  failedToFetchClassLevels: {
    id: `${scope}.failedToFetchClassLevels`,
    defaultMessage: 'Failed to fetch class levels',
  },
});
