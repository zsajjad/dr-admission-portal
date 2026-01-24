'use client';

import { useCallback, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

import { Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { AssetViewer } from '@/components/Asset';

import { KEYS } from '@/providers/constants/key';
import { useAdmissionsControllerUpdateStatus } from '@/providers/service/admissions/admissions';
import { Admission, UpdateAdmissionStatusDtoStatus } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from './messages';

interface AssetsDrawerProps {
  open: boolean;
  onClose: () => void;
  admission: Admission | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'DUPLICATE_MERGED':
      return 'warning';
    case 'MANUAL_VERIFICATION_REQUIRED':
      return 'warning';
    default:
      return 'default';
  }
};

export function AssetsDrawer({ open, onClose, admission }: AssetsDrawerProps) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectedReason, setRejectedReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const updateStatusMutation = useAdmissionsControllerUpdateStatus();

  const formattedMessages = {
    verifySuccess: useFormattedMessage(messages.verifySuccess),
    verifyError: useFormattedMessage(messages.verifyError),
    rejectSuccess: useFormattedMessage(messages.rejectSuccess),
    rejectError: useFormattedMessage(messages.rejectError),
    rejectedReasonRequired: useFormattedMessage(messages.rejectedReasonRequired),
    rejectedReasonPlaceholder: useFormattedMessage(messages.rejectedReasonPlaceholder),
    manualVerificationSuccess: useFormattedMessage(messages.manualVerificationSuccess),
    manualVerificationError: useFormattedMessage(messages.manualVerificationError),
  };

  const handleVerify = useCallback(() => {
    if (!admission) return;

    updateStatusMutation.mutate(
      {
        id: admission.id,
        data: {
          status: UpdateAdmissionStatusDtoStatus.VERIFIED,
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar(formattedMessages.verifySuccess, { variant: 'success' });
          queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_LISTING] });
          onClose();
        },
        onError: (error) => {
          enqueueSnackbar(extractNetworkError(error) || formattedMessages.verifyError, { variant: 'error' });
        },
      },
    );
  }, [admission, updateStatusMutation, queryClient, enqueueSnackbar, formattedMessages, onClose]);

  const handleManualVerification = useCallback(() => {
    if (!admission) return;

    updateStatusMutation.mutate(
      {
        id: admission.id,
        data: {
          status: 'MANUAL_VERIFICATION_REQUIRED' as UpdateAdmissionStatusDtoStatus,
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar(formattedMessages.manualVerificationSuccess, { variant: 'success' });
          queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_LISTING] });
          onClose();
        },
        onError: (error) => {
          enqueueSnackbar(extractNetworkError(error) || formattedMessages.manualVerificationError, {
            variant: 'error',
          });
        },
      },
    );
  }, [admission, updateStatusMutation, queryClient, enqueueSnackbar, formattedMessages, onClose]);

  const handleReject = useCallback(() => {
    if (!admission) return;

    if (!rejectedReason.trim()) {
      setRejectionError(formattedMessages.rejectedReasonRequired);
      return;
    }

    setRejectionError('');

    updateStatusMutation.mutate(
      {
        id: admission.id,
        data: {
          status: UpdateAdmissionStatusDtoStatus.REJECTED,
          rejectedReason: rejectedReason.trim(),
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar(formattedMessages.rejectSuccess, { variant: 'success' });
          queryClient.invalidateQueries({ queryKey: [KEYS.ADMISSION_LISTING] });
          setShowRejectForm(false);
          setRejectedReason('');
          onClose();
        },
        onError: (error) => {
          enqueueSnackbar(extractNetworkError(error) || formattedMessages.rejectError, { variant: 'error' });
        },
      },
    );
  }, [admission, rejectedReason, updateStatusMutation, queryClient, enqueueSnackbar, formattedMessages, onClose]);

  const handleClose = useCallback(() => {
    setShowRejectForm(false);
    setRejectedReason('');
    setRejectionError('');
    onClose();
  }, [onClose]);

  const isVerified = admission?.status === UpdateAdmissionStatusDtoStatus.VERIFIED;
  const isRejected = admission?.status === UpdateAdmissionStatusDtoStatus.REJECTED;
  const isUnverified = admission?.status === UpdateAdmissionStatusDtoStatus.UNVERIFIED;
  const isManualVerificationRequired = (admission?.status as string) === 'MANUAL_VERIFICATION_REQUIRED';
  const canChangeStatus = !isVerified && !isRejected;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 }, p: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <FormattedMessage {...messages.title} />
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {admission && (
        <Stack spacing={3}>
          {/* Student Info */}
          <Box>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.studentName} />
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {admission.student?.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.fatherName} />
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {admission.student?.fatherName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.grNumber} />
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {admission.student?.grNumber || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.phone} />
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {admission.student?.phone}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.branch} />
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {admission.branch?.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.area} />
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {admission.area?.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.status} />
                </Typography>
                <Chip label={admission.status} color={getStatusColor(admission.status)} size="small" />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: 'primary.light',
                  color: 'white',
                  borderRadius: 1,
                  padding: 1,
                }}
              >
                <Typography variant="body1" color="white" fontWeight="medium">
                  <FormattedMessage {...messages.dateOfBirth} />
                </Typography>
                <Typography variant="body1" color="white" fontWeight="bold">
                  {admission.student?.dateOfBirth ? format(admission.student?.dateOfBirth, 'dd / MM / yyyy') : '-'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Student Photo */}
          {/* <Box>
            <Typography variant="subtitle2" gutterBottom>
              <FormattedMessage {...messages.studentPhoto} />
            </Typography>
            {admission.student?.photoAssetId ? (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  p: 1,
                }}
              >
                <AssetViewer
                  assetId={admission.student.photoAssetId}
                  width={200}
                  height={200}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            ) : (
              <Alert severity="info" variant="outlined">
                <FormattedMessage {...messages.noPhoto} />
              </Alert>
            )}
          </Box> */}

          {/* Identity Proof */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              <FormattedMessage {...messages.identityProof} />
            </Typography>
            {admission.student?.identityProofAssetId ? (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  p: 2,
                }}
              >
                <AssetViewer
                  assetId={admission.student.identityProofAssetId}
                  width={520}
                  height={350}
                  style={{ objectFit: 'contain', cursor: 'zoom-in' }}
                  zoomable
                />
              </Box>
            ) : (
              <Alert severity="info" variant="outlined">
                <FormattedMessage {...messages.noIdentityProof} />
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Action Buttons */}
          {canChangeStatus ? (
            <Stack spacing={2}>
              {/* Info message based on current status */}
              {isUnverified && (
                <Alert severity="info">
                  <FormattedMessage {...messages.unverifiedInfo} />
                </Alert>
              )}
              {isManualVerificationRequired && (
                <Alert severity="warning">
                  <FormattedMessage {...messages.manualVerificationRequiredInfo} />
                </Alert>
              )}

              {!showRejectForm ? (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={handleVerify}
                    disabled={updateStatusMutation.isPending}
                    startIcon={updateStatusMutation.isPending ? <CircularProgress size={16} /> : null}
                  >
                    {updateStatusMutation.isPending ? (
                      <FormattedMessage {...messages.verifying} />
                    ) : (
                      <FormattedMessage {...messages.markAsVerified} />
                    )}
                  </Button>

                  {/* UNVERIFIED: Can mark as MANUAL_VERIFICATION_REQUIRED */}
                  {isUnverified && (
                    <Button
                      variant="outlined"
                      color="warning"
                      fullWidth
                      onClick={handleManualVerification}
                      disabled={updateStatusMutation.isPending}
                    >
                      <FormattedMessage {...messages.markAsManualVerification} />
                    </Button>
                  )}

                  {/* MANUAL_VERIFICATION_REQUIRED: Can reject */}
                  {isManualVerificationRequired && (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => setShowRejectForm(true)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <FormattedMessage {...messages.markAsRejected} />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectedReason}
                    onChange={(e) => setRejectedReason(e.target.value)}
                    label={<FormattedMessage {...messages.rejectedReason} />}
                    placeholder={formattedMessages.rejectedReasonPlaceholder}
                    error={!!rejectionError}
                    helperText={rejectionError}
                  />
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectedReason('');
                        setRejectionError('');
                      }}
                      disabled={updateStatusMutation.isPending}
                    >
                      <FormattedMessage {...messages.cancel} />
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={handleReject}
                      disabled={updateStatusMutation.isPending}
                      startIcon={updateStatusMutation.isPending ? <CircularProgress size={16} /> : null}
                    >
                      <FormattedMessage {...messages.markAsRejected} />
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          ) : (
            <Alert severity={isVerified ? 'success' : 'error'}>
              {isVerified ? (
                <FormattedMessage {...messages.alreadyVerified} />
              ) : (
                <>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    <FormattedMessage {...messages.rejectedReason} />:
                  </Typography>
                  <Typography variant="body2">{admission.rejectedReason}</Typography>
                </>
              )}
            </Alert>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
