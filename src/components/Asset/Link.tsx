import Link from 'next/link';

import OpenInNew from '@mui/icons-material/OpenInNew';
import { Box, Skeleton, SxProps, Theme, Tooltip } from '@mui/material';

import { useAssetsControllerGetDetail } from '@/providers/service/assets/assets';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { messages } from './message';

interface AssetLinkProps {
  label?: string | React.ReactNode;
  assetId: string;
  tooltipContent?: string | React.ReactNode;
  sx?: SxProps<Theme>;
}

export function AssetLink({ assetId, label, tooltipContent, sx }: AssetLinkProps) {
  const defaultTooltipContent = useFormattedMessage(messages.openInNewTab);
  const { data: asset, isLoading } = useAssetsControllerGetDetail(assetId);

  if (isLoading) return <Skeleton variant="rectangular" sx={sx} />;

  if (!asset?.signedUrl) return null;

  return (
    <Tooltip title={tooltipContent || defaultTooltipContent} placement="top">
      <Box sx={{ width: '100%', ...sx }}>
        <Link
          href={asset?.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {label}
          <OpenInNew fontSize="small" />
        </Link>
      </Box>
    </Tooltip>
  );
}
