import { useEffect, useState } from 'react';

import { SxProps, Theme } from '@mui/material';

import { AssetsControllerUploadPublicType } from '@/providers/service/app.schemas';
import {
  useAssetsControllerDelete,
  useAssetsControllerGetDetail,
  useAssetsControllerUploadPublic,
} from '@/providers/service/assets/assets';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { messages } from '../message';

import { AssetDeleteConfirmation } from './Confirmation';
import { AssetUploadBox } from './UploadBox';

interface AssetUploaderProps {
  onUploadSuccess: (asset: { id: string }) => void;
  onError: (error: Error) => void;
  onDeleteSuccess: (assetId: string) => void;
  category: string;
  type: AssetsControllerUploadPublicType;
  initialValue?: { id: string };
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  height?: number;
  imageUrl?: string;
  sx?: SxProps<Theme>;
}

export function AssetUploader(props: AssetUploaderProps) {
  const {
    onUploadSuccess,
    onError,
    onDeleteSuccess,
    category,
    type,
    initialValue,
    maxSizeMB,
    label,
    helperText,
    error,
  } = props;
  const snackbar = useSnackbarContext();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [visibleAssetId, setVisibleAssetId] = useState<string | undefined>(initialValue?.id);

  const assetDelete = useAssetsControllerDelete();
  const assetUpload = useAssetsControllerUploadPublic();

  const successUpload = useFormattedMessage(messages.successUpload);
  const errorUpload = useFormattedMessage(messages.errorUpload);
  const successDelete = useFormattedMessage(messages.deleteConfirmationSuccess);
  const errorDelete = useFormattedMessage(messages.deleteConfirmationError);

  useEffect(() => {
    setVisibleAssetId(initialValue?.id);
  }, [initialValue?.id]);

  const assetDetail = useAssetsControllerGetDetail(visibleAssetId ?? '', {
    query: {
      enabled: !!visibleAssetId,
    },
  });

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    await assetUpload.mutateAsync(
      {
        data: {
          file,
        },
        params: {
          category,
          type,
        },
      },
      {
        onSuccess: (data) => {
          onUploadSuccess(data);
          setVisibleAssetId(data.id);
          assetUpload.reset();
          snackbar.show({
            message: successUpload,
            type: 'success',
          });
        },
        onError: (error) => {
          onError(error as Error);
          snackbar.show({
            message: errorUpload,
            type: 'error',
          });
        },
      },
    );
  };

  const handleDelete = async () => {
    if (!visibleAssetId) return;
    setOpenDeleteConfirmation(false);
    await assetDelete.mutateAsync(
      {
        id: visibleAssetId,
      },
      {
        onSuccess: () => {
          onDeleteSuccess(visibleAssetId);
          setVisibleAssetId(undefined);
          snackbar.show({
            message: successDelete,
            type: 'success',
          });
        },
        onError: (error) => {
          onError(error as Error);
          snackbar.show({
            message: errorDelete,
            type: 'error',
          });
        },
      },
    );
  };

  const handleChange = (file: File | null) => {
    if (file) {
      handleUpload(file);
      return;
    }
    assetUpload.reset();
    if (visibleAssetId) {
      setOpenDeleteConfirmation(true);
      return;
    }
  };

  return (
    <>
      <AssetDeleteConfirmation
        open={openDeleteConfirmation}
        onClose={() => setOpenDeleteConfirmation(false)}
        onDelete={handleDelete}
      />
      <AssetUploadBox
        value={assetUpload.variables?.data?.file ?? null}
        imageUrl={assetDetail.data?.signedUrl}
        onChange={handleChange}
        error={!!error}
        helperText={helperText}
        maxSizeMB={maxSizeMB}
        label={label}
        accept={type === 'DOCUMENT' ? 'application/pdf' : 'image/*'}
        disabled={props.disabled || assetUpload.isPending}
        loading={assetUpload.isPending}
        height={props.height}
        sx={props.sx}
      />
    </>
  );
}
