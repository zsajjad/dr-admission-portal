/*
 * ErrorBoundary Messages
 *
 * This contains all the text for the ErrorBoundary component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.ErrorBoundary.title',
    defaultMessage: 'Something went wrong',
  },
  description: {
    id: 'app.components.ErrorBoundary.description',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
  tryAgain: {
    id: 'app.components.ErrorBoundary.tryAgain',
    defaultMessage: 'Try again',
  },
  goHome: {
    id: 'app.components.ErrorBoundary.goHome',
    defaultMessage: 'Go back to home',
  },
});
