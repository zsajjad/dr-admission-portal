/*
 * Audit log viewer: who changed what, and when
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.auditLog';

export default defineMessages({
  title: { id: `${scope}.title`, defaultMessage: 'Audit log' },
  intro: {
    id: `${scope}.intro`,
    defaultMessage:
      'Every change made through the portal and the staff app, newest first. Entries can’t be edited or deleted; each one is chained to the one before it.',
  },
  actor: { id: `${scope}.actor`, defaultMessage: 'Who' },
  entityType: { id: `${scope}.entityType`, defaultMessage: 'What kind of record' },
  entityId: { id: `${scope}.entityId`, defaultMessage: 'Record ID' },
  action: { id: `${scope}.action`, defaultMessage: 'Action' },
  from: { id: `${scope}.from`, defaultMessage: 'From' },
  to: { id: `${scope}.to`, defaultMessage: 'To' },
  any: { id: `${scope}.any`, defaultMessage: 'Any' },
  clear: { id: `${scope}.clear`, defaultMessage: 'Clear filters' },
  noRows: { id: `${scope}.noRows`, defaultMessage: 'No entries match these filters' },
  loadFailed: { id: `${scope}.loadFailed`, defaultMessage: 'Couldn’t load the audit log.' },

  // Actor types
  actorADMIN: { id: `${scope}.actorADMIN`, defaultMessage: 'Admin' },
  actorSTAFF: { id: `${scope}.actorSTAFF`, defaultMessage: 'Staff app' },
  actorSYSTEM: { id: `${scope}.actorSYSTEM`, defaultMessage: 'System' },
  staffCard: { id: `${scope}.staffCard`, defaultMessage: 'Staff ID {id}' },
  unknownActor: { id: `${scope}.unknownActor`, defaultMessage: 'Unknown' },

  // Columns
  colSeq: { id: `${scope}.colSeq`, defaultMessage: '#' },
  colWhen: { id: `${scope}.colWhen`, defaultMessage: 'When' },
  colWho: { id: `${scope}.colWho`, defaultMessage: 'Who' },
  colAction: { id: `${scope}.colAction`, defaultMessage: 'Action' },
  colRecord: { id: `${scope}.colRecord`, defaultMessage: 'Record' },
  colReason: { id: `${scope}.colReason`, defaultMessage: 'Reason' },

  // Detail
  detailTitle: { id: `${scope}.detailTitle`, defaultMessage: 'Entry #{seq}' },
  changed: { id: `${scope}.changed`, defaultMessage: 'What changed' },
  field: { id: `${scope}.field`, defaultMessage: 'Field' },
  before: { id: `${scope}.before`, defaultMessage: 'Before' },
  after: { id: `${scope}.after`, defaultMessage: 'After' },
  noChanges: { id: `${scope}.noChanges`, defaultMessage: 'No before and after values were recorded.' },
  fullBefore: { id: `${scope}.fullBefore`, defaultMessage: 'Everything before' },
  fullAfter: { id: `${scope}.fullAfter`, defaultMessage: 'Everything after' },
  reason: { id: `${scope}.reason`, defaultMessage: 'Reason' },
  noReason: { id: `${scope}.noReason`, defaultMessage: 'No reason given' },
  ip: { id: `${scope}.ip`, defaultMessage: 'IP address' },
  device: { id: `${scope}.device`, defaultMessage: 'Phone' },
  hash: { id: `${scope}.hash`, defaultMessage: 'Hash' },
  prevHash: { id: `${scope}.prevHash`, defaultMessage: 'Previous entry’s hash' },
  sameRecord: { id: `${scope}.sameRecord`, defaultMessage: 'All changes to this record' },
  close: { id: `${scope}.close`, defaultMessage: 'Close' },

  // Chain check
  verify: { id: `${scope}.verify`, defaultMessage: 'Check the chain' },
  verifying: { id: `${scope}.verifying`, defaultMessage: 'Checking every entry…' },
  verifyOk: {
    id: `${scope}.verifyOk`,
    defaultMessage: 'All {count} entries are present and unchanged.',
  },
  verifyBad: {
    id: `${scope}.verifyBad`,
    defaultMessage: 'Problem at entry #{seq} (after {count} good entries): {problem}',
  },
  verifyFailed: { id: `${scope}.verifyFailed`, defaultMessage: 'The check couldn’t run' },
  verifyHint: {
    id: `${scope}.verifyHint`,
    defaultMessage: 'Recomputes every entry’s hash to show nothing was edited or deleted. Super admins only.',
  },
});
