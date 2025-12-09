import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Accept, FileRejection, useDropzone } from 'react-dropzone';

import Link from 'next/link';

import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileOpen from '@mui/icons-material/FileOpen';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { alpha, Box, IconButton, Stack, SxProps, Theme, Typography } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { messages } from '../message';

interface AssetUploadBoxProps {
  value?: File | Blob | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  height?: number;
  imageUrl?: string;
  loading?: boolean;
  sx?: SxProps<Theme>;
}

function toReactDropzoneAccept(accept?: string): Accept | undefined {
  if (!accept) return undefined;
  // Accept string can be comma-separated (e.g., 'image/*,application/pdf,.png')
  const parts = accept
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return undefined;
  const acc: Accept = {};
  parts.forEach((p) => {
    acc[p] = [];
  });
  return acc;
}

export function AssetUploadBox({
  value,
  onChange,
  accept = 'image/*',
  maxSizeMB = 1,
  label = 'Click or drop a file here',
  helperText,
  error = false,
  disabled = false,
  height = 180,
  imageUrl,
  loading = false,
  sx,
}: AssetUploadBoxProps) {
  const [innerFile, setInnerFile] = useState<File | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const file = (value as File) ?? innerFile;

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return imageUrl ?? null;
  }, [file, imageUrl]);

  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  const applyChange = useCallback(
    (next: File | null) => {
      if (value === undefined) setInnerFile(next);
      onChange?.(next);
    },
    [onChange, value],
  );

  const maxBytes = maxSizeMB * 1024 * 1024;

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const first = acceptedFiles[0];
      setRejectionMessage(null);
      applyChange(first ?? null);
    },
    [applyChange],
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (!fileRejections.length) return;
    const first = fileRejections[0];
    const msg = first.errors?.[0]?.message || 'File not accepted';
    setRejectionMessage(msg);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    disabled,
    onDropAccepted,
    onDropRejected,
    maxSize: maxBytes,
    accept: toReactDropzoneAccept(accept),
    // Allow click + keyboard by default
  });

  const showAsImage = useMemo(() => {
    if (accept.includes('image/*')) return true;
    if (file && (file.type?.startsWith('image/') ?? false)) return true;
    return false;
  }, [accept, file]);

  return (
    <Stack spacing={1.25} sx={sx}>
      <Box
        {...getRootProps()}
        sx={{
          position: 'relative',
          border: '2px dashed',
          borderColor: (theme) =>
            error || isDragReject
              ? theme.palette.error.main
              : isDragAccept
                ? theme.palette.success.main
                : alpha(theme.palette.text.primary, 0.25),
          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.15),
          borderRadius: 2,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: isDragActive ? '2px solid' : 'none',
          outlineColor: (theme) => (isDragReject ? theme.palette.error.main : theme.palette.primary.main),
          transition: 'background-color .15s ease, outline-color .15s ease',
          '&:hover': { bgcolor: (theme) => alpha(theme.palette.action.hover, 0.25) },
          overflow: 'hidden',
          padding: 1,
        }}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <>
            {showAsImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={imageUrl ?? (file instanceof File ? file.name : 'uploaded file')}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <Stack direction="row" alignItems="center" spacing={2} sx={{ pointerEvents: 'none' }}>
                <FileOpen />
                <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {file instanceof File ? file.name : <FormattedMessage {...messages.uploadedFileLabel} />}
                </Typography>
                <Link href={previewUrl} target="_blank" onClick={(e) => e.stopPropagation()}>
                  <OpenInNewIcon />
                </Link>
              </Stack>
            )}
            {!disabled && !loading && (
              <IconButton
                aria-label="Remove file"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  applyChange(null);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                  '&:hover': { bgcolor: (theme) => alpha(theme.palette.background.paper, 1) },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="body2">Uploading...</Typography>
              </Box>
            )}
          </>
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ pointerEvents: 'none' }}>
            <CloudUploadIcon fontSize="large" />
            <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {`Max ${maxSizeMB}MB`}
            </Typography>
            {rejectionMessage && (
              <Typography variant="caption" color="error">
                {rejectionMessage}
              </Typography>
            )}
          </Stack>
        )}
      </Box>
      {(helperText || error) && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
          {helperText}
        </Typography>
      )}
    </Stack>
  );
}
