// cspell:ignore Namaz Wazu سیشن کلاس کتنے طلبہ
import { defineMessages } from 'react-intl';

const scope = 'app.domains.planningChat';

export default defineMessages({
  pageTitle: { id: `${scope}.pageTitle`, defaultMessage: 'Planning chat' },
  subtitle: {
    id: `${scope}.subtitle`,
    defaultMessage: 'Ask about admissions, fee days, attendance, results and interviews. Answers use totals only.',
  },
  noPermission: {
    id: `${scope}.noPermission`,
    defaultMessage: 'The planning chat needs the reports.chat permission. Ask a super admin.',
  },
  notEnabled: {
    id: `${scope}.notEnabled`,
    defaultMessage: 'The planning chat is not set up on the server yet.',
  },
  remaining: {
    id: `${scope}.remaining`,
    defaultMessage: '{remaining} of {limit} questions left today',
  },
  monthlyCapReached: {
    id: `${scope}.monthlyCapReached`,
    defaultMessage: "This month's budget is used up. The chat opens again on the 1st.",
  },
  newConversation: { id: `${scope}.newConversation`, defaultMessage: 'New conversation' },
  conversations: { id: `${scope}.conversations`, defaultMessage: 'Conversations' },
  everyone: { id: `${scope}.everyone`, defaultMessage: "Everyone's" },
  noConversations: { id: `${scope}.noConversations`, defaultMessage: 'No conversations yet' },
  questionsCount: { id: `${scope}.questionsCount`, defaultMessage: 'Questions: {count}' },
  placeholder: {
    id: `${scope}.placeholder`,
    defaultMessage: 'Ask a question, in Urdu or English. e.g. How many girls paid the fee in each branch?',
  },
  privacyHint: {
    id: `${scope}.privacyHint`,
    defaultMessage:
      "Only counts and totals are sent to Claude. Don't type names, phone, GR or B-form numbers; for lists of students use the portal's reports.",
  },
  send: { id: `${scope}.send`, defaultMessage: 'Ask' },
  stop: { id: `${scope}.stop`, defaultMessage: 'Stop' },
  thinking: { id: `${scope}.thinking`, defaultMessage: 'Working on it…' },
  lookingUp: { id: `${scope}.lookingUp`, defaultMessage: 'Looking up: {tool}' },
  whatWasLookedUp: {
    id: `${scope}.whatWasLookedUp`,
    defaultMessage: 'What was looked up ({count})',
  },
  rows: { id: `${scope}.rows`, defaultMessage: 'Rows: {count}' },
  hiddenGroups: {
    id: `${scope}.hiddenGroups`,
    defaultMessage: 'Small groups hidden: {count} (fewer than 5 students)',
  },
  lookupFailed: { id: `${scope}.lookupFailed`, defaultMessage: 'Failed: {error}' },
  noFilters: { id: `${scope}.noFilters`, defaultMessage: 'No filters' },
  refused: { id: `${scope}.refused`, defaultMessage: 'Claude declined this question.' },
  failed: { id: `${scope}.failed`, defaultMessage: 'This question could not be answered.' },
  conversationFull: {
    id: `${scope}.conversationFull`,
    defaultMessage: 'This conversation is full. Start a new one to ask more.',
  },
  notYours: { id: `${scope}.notYours`, defaultMessage: "This is someone else's conversation: you can read it only." },
  emptyTitle: { id: `${scope}.emptyTitle`, defaultMessage: 'Ask the first question' },
  example1: {
    id: `${scope}.example1`,
    defaultMessage: 'How many students applied this session, new and returning, by branch?',
  },
  example2: { id: `${scope}.example2`, defaultMessage: 'Fee day progress by hour for boys' },
  example3: { id: `${scope}.example3`, defaultMessage: 'Which Namaz steps did most students get wrong?' },
  example4: { id: `${scope}.example4`, defaultMessage: 'اس سیشن میں ہر کلاس میں کتنے طلبہ ہیں؟' },
  usage: { id: `${scope}.usage`, defaultMessage: '{tokens} tokens · about ${cost}' },
  serviceTokens: { id: `${scope}.serviceTokens`, defaultMessage: 'MCP tokens' },
  serviceTokensTitle: { id: `${scope}.serviceTokensTitle`, defaultMessage: 'Reports MCP tokens' },
  serviceTokensHelp: {
    id: `${scope}.serviceTokensHelp`,
    defaultMessage:
      'A token lets a Claude client on another machine use the report tools (/mcp/reports), and nothing else. It is shown once.',
  },
  tokenName: { id: `${scope}.tokenName`, defaultMessage: 'What is it for?' },
  dailyCallLimit: { id: `${scope}.dailyCallLimit`, defaultMessage: 'Calls per day' },
  perMinuteLimit: { id: `${scope}.perMinuteLimit`, defaultMessage: 'Requests per minute' },
  createToken: { id: `${scope}.createToken`, defaultMessage: 'Create token' },
  copyTokenNow: {
    id: `${scope}.copyTokenNow`,
    defaultMessage: 'Copy this token now. It will not be shown again.',
  },
  copy: { id: `${scope}.copy`, defaultMessage: 'Copy' },
  copied: { id: `${scope}.copied`, defaultMessage: 'Copied' },
  revoke: { id: `${scope}.revoke`, defaultMessage: 'Revoke' },
  confirmRevoke: { id: `${scope}.confirmRevoke`, defaultMessage: 'Click again to revoke' },
  tokenColumn: { id: `${scope}.tokenColumn`, defaultMessage: 'Token' },
  revoked: { id: `${scope}.revoked`, defaultMessage: 'Revoked' },
  lastUsed: { id: `${scope}.lastUsed`, defaultMessage: 'Last used' },
  never: { id: `${scope}.never`, defaultMessage: 'Never' },
  close: { id: `${scope}.close`, defaultMessage: 'Close' },
  noTokens: { id: `${scope}.noTokens`, defaultMessage: 'No tokens' },
  toolGetReferenceData: { id: `${scope}.toolGetReferenceData`, defaultMessage: 'Sessions, branches and classes' },
  toolAdmissionsReport: { id: `${scope}.toolAdmissionsReport`, defaultMessage: 'Admissions' },
  toolFeeDayProgress: { id: `${scope}.toolFeeDayProgress`, defaultMessage: 'Fee day progress' },
  toolAttendanceReport: { id: `${scope}.toolAttendanceReport`, defaultMessage: 'Attendance by day' },
  toolAttendanceDistribution: { id: `${scope}.toolAttendanceDistribution`, defaultMessage: 'Attendance distribution' },
  toolResultsReport: { id: `${scope}.toolResultsReport`, defaultMessage: 'Results by part' },
  toolFinalResultsReport: { id: `${scope}.toolFinalResultsReport`, defaultMessage: 'Final results' },
  toolSkillStepsReport: { id: `${scope}.toolSkillStepsReport`, defaultMessage: 'Wazu and Namaz steps' },
  toolInterviewsReport: { id: `${scope}.toolInterviewsReport`, defaultMessage: 'Interview ratings' },
  toolRunReportQuery: { id: `${scope}.toolRunReportQuery`, defaultMessage: 'Custom report query' },
});
