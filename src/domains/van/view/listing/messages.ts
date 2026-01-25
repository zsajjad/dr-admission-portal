/*
 * Van Listing Messages
 *
 * This contains all the text for the Van listing components.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.van.view.listing';

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
    defaultMessage: 'No Vans Found',
  },

  // Update
  updateSuccess: {
    id: `${scope}.updateSuccess`,
    defaultMessage: 'Van updated successfully',
  },
  errorSuccess: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },

  // Header Names
  codeHeaderName: {
    id: `${scope}.codeHeaderName`,
    defaultMessage: 'Code',
  },
  nameHeaderName: {
    id: `${scope}.nameHeaderName`,
    defaultMessage: 'Name',
  },
  colorHeaderName: {
    id: `${scope}.colorHeaderName`,
    defaultMessage: 'Color',
  },
  areasHeaderName: {
    id: `${scope}.areasHeaderName`,
    defaultMessage: 'Areas',
  },
  maleConfirmedHeaderName: {
    id: `${scope}.maleConfirmedHeaderName`,
    defaultMessage: 'Boys ✓',
  },
  maleAppliedHeaderName: {
    id: `${scope}.maleAppliedHeaderName`,
    defaultMessage: 'Boys ○',
  },
  femaleConfirmedHeaderName: {
    id: `${scope}.femaleConfirmedHeaderName`,
    defaultMessage: 'Girls ✓',
  },
  femaleAppliedHeaderName: {
    id: `${scope}.femaleAppliedHeaderName`,
    defaultMessage: 'Girls ○',
  },
  actionsHeaderName: {
    id: `${scope}.actionsHeaderName`,
    defaultMessage: 'Actions',
  },

  // Van rules description
  vanRulesDescription: {
    id: `${scope}.vanRulesDescription`,
    defaultMessage:
      'Van colors are assigned based on area. Fallback to branch default color occurs for: Muhiban class level (any gender), Nasiran class level (male only), areas without van service, or areas without boys van service for male students.',
  },
});
