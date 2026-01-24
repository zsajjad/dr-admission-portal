'use client';

import { useCallback, useState } from 'react';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import {
  Add as ZoomInIcon,
  Close as CloseIcon,
  Remove as ZoomOutIcon,
  RestartAlt as ResetIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
} from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';

export interface FullScreenViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function FullScreenViewer({ src, alt, onClose }: FullScreenViewerProps) {
  const [rotation, setRotation] = useState(0);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const handleReset = useCallback((resetTransform: () => void) => {
    setRotation(0);
    resetTransform();
  }, []);

  return (
    <Box
      tabIndex={-1}
      sx={{
        width: '100vw',
        height: '100vh',
        outline: 'none',
        position: 'relative',
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        centerZoomedOut
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'reset' }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Close Button */}
            <Tooltip title="Close (Esc)">
              <IconButton
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>

            {/* Zoom & Rotate Controls */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 2,
                p: 0.5,
              }}
            >
              <Tooltip title="Rotate Left">
                <IconButton onClick={handleRotateLeft} size="small" sx={{ color: 'white' }}>
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={() => zoomOut()} size="small" sx={{ color: 'white' }}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset">
                <IconButton onClick={() => handleReset(resetTransform)} size="small" sx={{ color: 'white' }}>
                  <ResetIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton onClick={() => zoomIn()} size="small" sx={{ color: 'white' }}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotate Right">
                <IconButton onClick={handleRotateRight} size="small" sx={{ color: 'white' }}>
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Zoomable Image */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={src}
                alt={alt}
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </Box>
  );
}
