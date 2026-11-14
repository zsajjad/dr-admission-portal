/*
 * Review of staff app work the server flagged on sync
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.syncReview';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Flagged staff app work' },
  intro: {
    id: `${scope}.intro`,
    defaultMessage:
      'The staff app flags two kinds of work for the office: work a phone sent after it was logged out, and attendance marked for an earlier day. It was saved when it arrived. Check it, then mark it reviewed.',
  },
  toReview: { id: `${scope}.toReview`, defaultMessage: 'To review' },
  reviewed: { id: `${scope}.reviewed`, defaultMessage: 'Reviewed' },
  reasonFilter: { id: `${scope}.reasonFilter`, defaultMessage: 'Why it was flagged' },
  allReasons: { id: `${scope}.allReasons`, defaultMessage: 'All' },
  staffFilter: { id: `${scope}.staffFilter`, defaultMessage: 'Sent by' },
  noRowsToReview: { id: `${scope}.noRowsToReview`, defaultMessage: 'Nothing to review' },
  noRowsReviewed: { id: `${scope}.noRowsReviewed`, defaultMessage: 'Nothing reviewed yet' },

  // Columns
  colReceived: { id: `${scope}.colReceived`, defaultMessage: 'Received' },
  colWhat: { id: `${scope}.colWhat`, defaultMessage: 'What it did' },
  colWhy: { id: `${scope}.colWhy`, defaultMessage: 'Why flagged' },
  colWho: { id: `${scope}.colWho`, defaultMessage: 'Sent by' },
  colPhone: { id: `${scope}.colPhone`, defaultMessage: 'Phone' },
  colMadeAt: { id: `${scope}.colMadeAt`, defaultMessage: 'Made on the phone' },
  colReviewed: { id: `${scope}.colReviewed`, defaultMessage: 'Reviewed' },

  // Reasons
  reasonSENT_AFTER_LOGOUT: { id: `${scope}.reasonSENT_AFTER_LOGOUT`, defaultMessage: 'Sent after logout' },
  reasonLATE_DAY: { id: `${scope}.reasonLATE_DAY`, defaultMessage: 'Earlier day' },
  reasonSENT_AFTER_LOGOUTHint: {
    id: `${scope}.reasonSENT_AFTER_LOGOUTHint`,
    defaultMessage: 'The phone was logged out, then sent work it had made before the logout.',
  },
  reasonLATE_DAYHint: {
    id: `${scope}.reasonLATE_DAYHint`,
    defaultMessage: 'Attendance was marked for a day that had already passed.',
  },

  // What it did
  typeAttendance: {
    id: `${scope}.typeAttendance`,
    defaultMessage: 'Attendance for {section}, {date}: {absent} absent',
  },
  typeInterview: { id: `${scope}.typeInterview`, defaultMessage: 'Interview of GR {gr}' },
  unknownSection: { id: `${scope}.unknownSection`, defaultMessage: 'a section' },
  phoneLoggedOut: { id: `${scope}.phoneLoggedOut`, defaultMessage: 'logged out {date}' },
  phoneDiscarded: { id: `${scope}.phoneDiscarded`, defaultMessage: 'unsent work discarded' },
  phoneGone: { id: `${scope}.phoneGone`, defaultMessage: 'Unknown phone' },
  reviewedBy: { id: `${scope}.reviewedBy`, defaultMessage: '{name}, {date}' },

  // Actions
  markReviewed: { id: `${scope}.markReviewed`, defaultMessage: 'Mark reviewed' },
  backToReview: { id: `${scope}.backToReview`, defaultMessage: 'Back to review' },
  selected: { id: `${scope}.selected`, defaultMessage: 'Selected: {count}' },
  reviewTitle: { id: `${scope}.reviewTitle`, defaultMessage: 'Mark {count} items reviewed' },
  reopenTitle: { id: `${scope}.reopenTitle`, defaultMessage: 'Put {count} items back to review' },
  reviewExplain: {
    id: `${scope}.reviewExplain`,
    defaultMessage: 'This records that you checked them. It doesn’t change the attendance or anything else they saved.',
  },
  noteOptional: { id: `${scope}.noteOptional`, defaultMessage: 'Note (optional): what you checked or did' },
  done: { id: `${scope}.done`, defaultMessage: 'Updated: {count}' },
  failed: { id: `${scope}.failed`, defaultMessage: 'Could not update' },

  // Detail
  detailTitle: { id: `${scope}.detailTitle`, defaultMessage: 'Flagged item' },
  itemId: { id: `${scope}.itemId`, defaultMessage: 'Item ID' },
  appVersion: { id: `${scope}.appVersion`, defaultMessage: 'App version' },
  noteToPhone: { id: `${scope}.noteToPhone`, defaultMessage: 'Note sent to the phone' },
  payload: { id: `${scope}.payload`, defaultMessage: 'What the phone sent' },
  close: { id: `${scope}.close`, defaultMessage: 'Close' },
});
