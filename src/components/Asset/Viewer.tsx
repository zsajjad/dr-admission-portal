import Zoom from 'react-medium-image-zoom';

import Image, { ImageProps } from 'next/image';
import Link from 'next/link';

import { Skeleton } from '@mui/material';

import { useAssetsControllerGetDetail } from '@/providers/service/assets/assets';

import 'react-medium-image-zoom/dist/styles.css';

interface AssetViewerProps extends Omit<ImageProps, 'src' | 'alt'> {
  assetId: string;
  /** Enable click-to-zoom functionality instead of opening in new tab */
  zoomable?: boolean;
}

export function AssetViewer({ assetId, zoomable = false, ...props }: AssetViewerProps) {
  const { data: asset, isLoading } = useAssetsControllerGetDetail(assetId);

  if (isLoading) return <Skeleton variant="rectangular" {...props} />;

  if (!asset?.signedUrl) return null;

  const imageElement = <Image id="next_image" src={asset?.signedUrl} alt={asset?.title} {...props} />;

  if (zoomable) {
    return <Zoom>{imageElement}</Zoom>;
  }

  return (
    <Link href={asset?.signedUrl} target="_blank" rel="noopener noreferrer">
      {imageElement}
    </Link>
  );
}
