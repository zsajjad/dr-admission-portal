'use client';

import { useEffect, useState } from 'react';

import { Grid } from '@mui/material';

import { AssetUploader } from '@/components/Asset/Uploader';

import { AssetsControllerUploadPublicType, StudentProfileIdentity } from '@/providers/service/app.schemas';
import { useStudentsControllerUpdate } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';

import { ProfileDialog } from './ProfileDialog';

interface DocumentsDialogProps {
  open: boolean;
  student: StudentProfileIdentity;
  onClose: () => void;
}

/** Photo and identity document, uploaded with the shared asset uploader */
export function DocumentsDialog({ open, student, onClose }: DocumentsDialogProps) {
  const { onSuccess, onError } = useProfileActions(student.id);
  const { show } = useSnackbarContext();
  const nothingChanged = useFormattedMessage(messages.nothingChanged);
  const photoLabel = useFormattedMessage(messages.photo);
  const identityLabel = useFormattedMessage(messages.identityProof);
  const mutation = useStudentsControllerUpdate();

  const [photoAssetId, setPhotoAssetId] = useState<string | undefined>(student.photoAsset?.id);
  const [identityProofAssetId, setIdentityProofAssetId] = useState<string | undefined>(student.identityProofAsset?.id);

  useEffect(() => {
    if (!open) return;
    setPhotoAssetId(student.photoAsset?.id);
    setIdentityProofAssetId(student.identityProofAsset?.id);
  }, [open, student.photoAsset?.id, student.identityProofAsset?.id]);

  const handleSave = () => {
    const changes: { photoAssetId?: string; identityProofAssetId?: string } = {};
    if (photoAssetId !== student.photoAsset?.id) changes.photoAssetId = photoAssetId ?? '';
    if (identityProofAssetId !== student.identityProofAsset?.id) {
      changes.identityProofAssetId = identityProofAssetId ?? '';
    }
    if (!Object.keys(changes).length) {
      show({ message: nothingChanged, type: 'info' });
      return;
    }
    mutation.mutate(
      { id: student.id, data: changes },
      {
        onSuccess: async () => {
          await onSuccess();
          onClose();
        },
        onError,
      },
    );
  };

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.documentsDialogTitle} />}
      onClose={onClose}
      onSubmit={handleSave}
      isSubmitting={mutation.isPending}
    >
      <Grid container spacing={2}>
        <Grid size={6}>
          <AssetUploader
            category="student_photo"
            type={AssetsControllerUploadPublicType.IMAGE}
            label={photoLabel}
            initialValue={photoAssetId ? { id: photoAssetId } : undefined}
            onUploadSuccess={(asset) => setPhotoAssetId(asset.id)}
            onDeleteSuccess={() => setPhotoAssetId(undefined)}
            onError={() => {}}
            height={180}
            disabled={mutation.isPending}
          />
        </Grid>
        <Grid size={6}>
          <AssetUploader
            category="admission"
            type={AssetsControllerUploadPublicType.IMAGE}
            label={identityLabel}
            initialValue={identityProofAssetId ? { id: identityProofAssetId } : undefined}
            onUploadSuccess={(asset) => setIdentityProofAssetId(asset.id)}
            onDeleteSuccess={() => setIdentityProofAssetId(undefined)}
            onError={() => {}}
            height={180}
            disabled={mutation.isPending}
          />
        </Grid>
      </Grid>
    </ProfileDialog>
  );
}
