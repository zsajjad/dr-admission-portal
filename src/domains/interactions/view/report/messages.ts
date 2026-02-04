import { defineMessages } from 'react-intl';

const scope = 'app.interactions.report';

export default defineMessages({
  // Page
  pageTitle: {
    id: `${scope}.pageTitle`,
    defaultMessage: 'Interaction Report',
  },
  pageSubtitle: {
    id: `${scope}.pageSubtitle`,
    defaultMessage: 'Analytics for student interaction ratings by question',
  },

  // Filters
  selectFiltersPrompt: {
    id: `${scope}.selectFiltersPrompt`,
    defaultMessage: 'Select filters to view report',
  },
  selectFiltersDescription: {
    id: `${scope}.selectFiltersDescription`,
    defaultMessage: 'Choose a session, branch, and class level to generate the interaction report',
  },

  // Stat cards
  totalInteractions: {
    id: `${scope}.totalInteractions`,
    defaultMessage: 'Total Interactions',
  },
  averageRating: {
    id: `${scope}.averageRating`,
    defaultMessage: 'Average Rating',
  },
  studentsNeedAttention: {
    id: `${scope}.studentsNeedAttention`,
    defaultMessage: 'Students Need Attention',
  },
  questionsAlert: {
    id: `${scope}.questionsAlert`,
    defaultMessage: 'Questions Alert',
  },

  // Charts
  ratingDistribution: {
    id: `${scope}.ratingDistribution`,
    defaultMessage: 'Rating Distribution by Question',
  },
  questionMetrics: {
    id: `${scope}.questionMetrics`,
    defaultMessage: 'Average Rating per Question',
  },
  admissionsAreaDistribution: {
    id: `${scope}.admissionsAreaDistribution`,
    defaultMessage: 'Admissions Distribution by Area',
  },
  admissionsLegacyNew: {
    id: `${scope}.admissionsLegacyNew`,
    defaultMessage: 'Legacy vs New Admissions',
  },

  // Table
  studentsTable: {
    id: `${scope}.studentsTable`,
    defaultMessage: 'Peer Teaching Groups',
  },
  grNumber: {
    id: `${scope}.grNumber`,
    defaultMessage: 'GR Number',
  },
  studentName: {
    id: `${scope}.studentName`,
    defaultMessage: 'Name',
  },
  area: {
    id: `${scope}.area`,
    defaultMessage: 'Area',
  },
  rating: {
    id: `${scope}.rating`,
    defaultMessage: 'Rating',
  },
  group: {
    id: `${scope}.group`,
    defaultMessage: 'Group',
  },
  noStudentsInGroup: {
    id: `${scope}.noStudentsInGroup`,
    defaultMessage: 'No students in this category',
  },
  studentsCount: {
    id: `${scope}.studentsCount`,
    defaultMessage: '{count} students',
  },

  // Peer teaching groups
  studentsBest: {
    id: `${scope}.studentsBest`,
    defaultMessage: 'Can Teach Others',
  },
  studentsAverage: {
    id: `${scope}.studentsAverage`,
    defaultMessage: 'Average',
  },
  studentsNeedingAttention: {
    id: `${scope}.studentsNeedingAttention`,
    defaultMessage: 'Need Help',
  },
  peerTeachingDescription: {
    id: `${scope}.peerTeachingDescription`,
    defaultMessage: 'Pair strong students with those needing help for peer learning',
  },

  // Rating labels
  rating1: {
    id: `${scope}.rating1`,
    defaultMessage: 'Very Low (1)',
  },
  rating2: {
    id: `${scope}.rating2`,
    defaultMessage: 'Low (2)',
  },
  rating3: {
    id: `${scope}.rating3`,
    defaultMessage: 'Average (3)',
  },
  rating4: {
    id: `${scope}.rating4`,
    defaultMessage: 'Good (4)',
  },
  rating5: {
    id: `${scope}.rating5`,
    defaultMessage: 'Excellent (5)',
  },

  // Insights
  bestQuestion: {
    id: `${scope}.bestQuestion`,
    defaultMessage: 'Best Performing Question',
  },
  worstQuestion: {
    id: `${scope}.worstQuestion`,
    defaultMessage: 'Needs Improvement',
  },

  // Loading and errors
  loading: {
    id: `${scope}.loading`,
    defaultMessage: 'Loading report...',
  },
  errorLoading: {
    id: `${scope}.errorLoading`,
    defaultMessage: 'Error loading report',
  },
  noData: {
    id: `${scope}.noData`,
    defaultMessage: 'No interaction data found',
  },
});
