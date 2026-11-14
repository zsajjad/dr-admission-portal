/*
 * Fiqh trainings: the trainers' ledger
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.trainings.ledger';

export default defineMessages({
  help: {
    id: `${scope}.help`,
    defaultMessage:
      'A closed enrollment adds its payout here, awaiting approval. Payments cover approved amounts oldest first. Balance due is approved minus paid. Pending is what open enrollments would pay now; it isn’t an entry yet.',
  },
  trainers: { id: `${scope}.trainers`, defaultMessage: 'Trainers' },
  entries: { id: `${scope}.entries`, defaultMessage: 'Entries' },
  projected: { id: `${scope}.projected`, defaultMessage: 'Pending' },
  awaitingApproval: { id: `${scope}.awaitingApproval`, defaultMessage: 'Awaiting approval' },
  approved: { id: `${scope}.approved`, defaultMessage: 'Approved' },
  paid: { id: `${scope}.paid`, defaultMessage: 'Paid' },
  due: { id: `${scope}.due`, defaultMessage: 'Balance due' },
  total: { id: `${scope}.total`, defaultMessage: 'Total' },
  noTrainers: { id: `${scope}.noTrainers`, defaultMessage: 'No trainer has earnings yet' },
  noEntries: { id: `${scope}.noEntries`, defaultMessage: 'No entries match' },
  showEntries: { id: `${scope}.showEntries`, defaultMessage: 'Entries' },
  approveAll: { id: `${scope}.approveAll`, defaultMessage: 'Approve all' },
  recordPayment: { id: `${scope}.recordPayment`, defaultMessage: 'Record payment' },
  improvement: { id: `${scope}.improvement`, defaultMessage: 'Improvement' },
  addAmount: { id: `${scope}.addAmount`, defaultMessage: 'Add amount' },
  addAmountTitle: { id: `${scope}.addAmountTitle`, defaultMessage: 'Add an amount' },
  addAmountExplain: {
    id: `${scope}.addAmountExplain`,
    defaultMessage:
      'An ad hoc credit to the trainer, such as an allowance or a bonus. It’s approved when made and adds to the balance due. Use an adjustment to correct an amount.',
  },
  title: { id: `${scope}.title`, defaultMessage: 'Title' },
  titlePlaceholder: { id: `${scope}.titlePlaceholder`, defaultMessage: 'e.g. Travel allowance' },
  addAdjustment: { id: `${scope}.addAdjustment`, defaultMessage: 'Add adjustment' },
  kind: { id: `${scope}.kind`, defaultMessage: 'Kind' },
  status: { id: `${scope}.status`, defaultMessage: 'Status' },
  from: { id: `${scope}.from`, defaultMessage: 'From' },
  to: { id: `${scope}.to`, defaultMessage: 'To' },
  date: { id: `${scope}.date`, defaultMessage: 'Date' },
  student: { id: `${scope}.student`, defaultMessage: 'Student' },
  amount: { id: `${scope}.amount`, defaultMessage: 'Amount' },
  covered: { id: `${scope}.covered`, defaultMessage: '{paid} of {amount} paid' },
  details: { id: `${scope}.details`, defaultMessage: 'Details' },
  reference: { id: `${scope}.reference`, defaultMessage: 'Reference' },
  exportCsv: { id: `${scope}.exportCsv`, defaultMessage: 'Export CSV' },
  approveSelected: { id: `${scope}.approveSelected`, defaultMessage: 'Approve {count} selected ({amount})' },
  approveTitle: { id: `${scope}.approveTitle`, defaultMessage: 'Approve {count} payouts?' },
  approveExplain: {
    id: `${scope}.approveExplain`,
    defaultMessage: 'Approving {amount} makes it due to the trainers, and each trainer is notified.',
  },
  approveNone: { id: `${scope}.approveNone`, defaultMessage: '{name} has nothing awaiting approval' },
  approved_ok: { id: `${scope}.approved_ok`, defaultMessage: 'Approved' },
  void: { id: `${scope}.void`, defaultMessage: 'Void' },
  voidTitle: { id: `${scope}.voidTitle`, defaultMessage: 'Void this {kind} of {amount}?' },
  voidExplain: {
    id: `${scope}.voidExplain`,
    defaultMessage: 'It stays in the ledger, marked void, and no longer counts in the balance.',
  },
  voided: { id: `${scope}.voided`, defaultMessage: 'Voided {at}: {reason}' },
  paymentTitle: { id: `${scope}.paymentTitle`, defaultMessage: 'Record a payment' },
  paymentExplain: {
    id: `${scope}.paymentExplain`,
    defaultMessage: 'Money sent to the trainer outside the system. It covers approved amounts oldest first.',
  },
  paidAt: { id: `${scope}.paidAt`, defaultMessage: 'Paid on' },
  note: { id: `${scope}.note`, defaultMessage: 'Note' },
  amountRs: { id: `${scope}.amountRs`, defaultMessage: 'Amount (Rs)' },
  amountPositive: { id: `${scope}.amountPositive`, defaultMessage: 'A whole amount above 0' },
  amountNonZero: { id: `${scope}.amountNonZero`, defaultMessage: 'A whole amount; negative to take money back' },
  dueNow: { id: `${scope}.dueNow`, defaultMessage: 'Balance due now: {due}' },
  moreThanDue: {
    id: `${scope}.moreThanDue`,
    defaultMessage: 'This is more than the balance due ({due}). Payments can’t be above what’s due.',
  },
  adjustmentTitle: { id: `${scope}.adjustmentTitle`, defaultMessage: 'Add an adjustment' },
  adjustmentExplain: {
    id: `${scope}.adjustmentExplain`,
    defaultMessage:
      'A correction to the trainer’s earnings, approved when made. Use a negative amount to take money back.',
  },
  enrollmentId: { id: `${scope}.enrollmentId`, defaultMessage: 'Enrollment (optional)' },
  pickTrainer: { id: `${scope}.pickTrainer`, defaultMessage: 'Pick a trainer' },
  openEnrollment: { id: `${scope}.openEnrollment`, defaultMessage: 'Open the enrollment' },
});
