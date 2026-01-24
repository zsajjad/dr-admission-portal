/*
 * Admission Assets Drawer Messages
 */
import { defineMessages } from 'react-intl';

const scope = 'app.domains.admission.components.assetsDrawer';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'Admission Assets',
  },
  studentPhoto: {
    id: `${scope}.studentPhoto`,
    defaultMessage: 'Student Photo',
  },
  identityProof: {
    id: `${scope}.identityProof`,
    defaultMessage: 'Identity Proof (B-Form/CNIC)',
  },
  noPhoto: {
    id: `${scope}.noPhoto`,
    defaultMessage: 'No photo uploaded',
  },
  noIdentityProof: {
    id: `${scope}.noIdentityProof`,
    defaultMessage: 'No identity proof uploaded',
  },
  markAsVerified: {
    id: `${scope}.markAsVerified`,
    defaultMessage: 'Mark as Verified',
  },
  markAsRejected: {
    id: `${scope}.markAsRejected`,
    defaultMessage: 'Mark as Rejected',
  },
  verifying: {
    id: `${scope}.verifying`,
    defaultMessage: 'Verifying...',
  },
  verifySuccess: {
    id: `${scope}.verifySuccess`,
    defaultMessage: 'Admission verified successfully',
  },
  verifyError: {
    id: `${scope}.verifyError`,
    defaultMessage: 'Failed to verify admission',
  },
  rejectSuccess: {
    id: `${scope}.rejectSuccess`,
    defaultMessage: 'Admission rejected successfully',
  },
  rejectError: {
    id: `${scope}.rejectError`,
    defaultMessage: 'Failed to reject admission',
  },
  studentName: {
    id: `${scope}.studentName`,
    defaultMessage: 'Student Name',
  },
  fatherName: {
    id: `${scope}.fatherName`,
    defaultMessage: 'Father Name',
  },
  grNumber: {
    id: `${scope}.grNumber`,
    defaultMessage: 'GR Number',
  },
  dateOfBirth: {
    id: `${scope}.dateOfBirth`,
    defaultMessage: 'Date of Birth',
  },
  phone: {
    id: `${scope}.phone`,
    defaultMessage: 'Phone',
  },
  status: {
    id: `${scope}.status`,
    defaultMessage: 'Status',
  },
  branch: {
    id: `${scope}.branch`,
    defaultMessage: 'Branch',
  },
  area: {
    id: `${scope}.area`,
    defaultMessage: 'Area',
  },
  alreadyVerified: {
    id: `${scope}.alreadyVerified`,
    defaultMessage: 'This admission is already verified',
  },
  rejectedReason: {
    id: `${scope}.rejectedReason`,
    defaultMessage: 'Rejection Reason',
  },
  rejectedReasonPlaceholder: {
    id: `${scope}.rejectedReasonPlaceholder`,
    defaultMessage: 'Enter reason for rejection',
  },
  rejectedReasonRequired: {
    id: `${scope}.rejectedReasonRequired`,
    defaultMessage: 'Rejection reason is required',
  },
  cancel: {
    id: `${scope}.cancel`,
    defaultMessage: 'Cancel',
  },
  markAsManualVerification: {
    id: `${scope}.markAsManualVerification`,
    defaultMessage: 'Mark as Manual Verification Required',
  },
  manualVerificationSuccess: {
    id: `${scope}.manualVerificationSuccess`,
    defaultMessage: 'Admission marked for manual verification',
  },
  manualVerificationError: {
    id: `${scope}.manualVerificationError`,
    defaultMessage: 'Failed to mark admission for manual verification',
  },
  unverifiedInfo: {
    id: `${scope}.unverifiedInfo`,
    defaultMessage: 'This admission can be verified or marked for manual verification.',
  },
  manualVerificationRequiredInfo: {
    id: `${scope}.manualVerificationRequiredInfo`,
    defaultMessage: 'This admission requires manual verification. You can verify or reject it.',
  },
});
