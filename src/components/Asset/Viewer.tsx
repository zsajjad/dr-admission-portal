import { useState } from 'react';

import Image, { ImageProps } from 'next/image';
import Link from 'next/link';

import { Box, Modal, Skeleton } from '@mui/material';

import { useAssetsControllerGetDetail } from '@/providers/service/assets/assets';

import { FullScreenViewer } from './FullScreenViewer';

interface AssetViewerProps extends Omit<ImageProps, 'src' | 'alt'> {
  assetId: string;
  /** Enable click-to-zoom functionality instead of opening in new tab */
  zoomable?: boolean;
}

export function AssetViewer({ assetId, zoomable = false, ...props }: AssetViewerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { data: asset, isLoading } = useAssetsControllerGetDetail(assetId);

  if (isLoading) return <Skeleton variant="rectangular" {...props} />;

  if (!asset?.signedUrl) return null;

  const imageElement = <Image id="next_image" src={asset?.signedUrl} alt={asset?.title} {...props} />;

  if (zoomable) {
    return (
      <>
        <Box onClick={() => setIsFullScreen(true)} sx={{ cursor: 'zoom-in', display: 'inline-block' }}>
          {imageElement}
        </Box>
        <Modal
          open={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              },
            },
          }}
        >
          <Box>
            <FullScreenViewer src={asset.signedUrl} alt={asset.title} onClose={() => setIsFullScreen(false)} />
          </Box>
        </Modal>
      </>
    );
  }

  return (
    <Link href={asset?.signedUrl} target="_blank" rel="noopener noreferrer">
      {imageElement}
    </Link>
  );
}
