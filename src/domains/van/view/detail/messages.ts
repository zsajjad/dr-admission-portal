/*
 * Van Detail Messages
 *
 * This contains all the text for the Van component.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.van.view.detail';

export default defineMessages({
  // Labels
  idLabel: {
    id: `${scope}.idLabel`,
    defaultMessage: 'ID',
  },
  codeLabel: {
    id: `${scope}.codeLabel`,
    defaultMessage: 'Van Code',
  },
  nameLabel: {
    id: `${scope}.nameLabel`,
    defaultMessage: 'Van Name',
  },
  branchLabel: {
    id: `${scope}.branchLabel`,
    defaultMessage: 'Branch',
  },
  colorNameLabel: {
    id: `${scope}.colorNameLabel`,
    defaultMessage: 'Color Name',
  },
  colorHexLabel: {
    id: `${scope}.colorHexLabel`,
    defaultMessage: 'Color',
  },
  areasLabel: {
    id: `${scope}.areasLabel`,
    defaultMessage: 'Areas',
  },

  // Status messages
  failToFetch: {
    id: `${scope}.failToFetch`,
    defaultMessage: 'Failed to fetch van details',
  },
  notFound: {
    id: `${scope}.notFound`,
    defaultMessage: 'Van Detail Not Found',
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
    defaultMessage: 'Van updated successfully',
  },
  errorUpdate: {
    id: `${scope}.errorSuccess`,
    defaultMessage: 'An error occurred',
  },
});
