import React, { useMemo } from 'react';

import JsonView from '@uiw/react-json-view';

import { truncateValue } from '@/utils';

interface IJsonViewerProps {
  src: object;
  maxDepth?: number;
  collapsed?: boolean;
  style?: React.CSSProperties;
}

export const JsonViewer: React.FC<IJsonViewerProps> = ({ src, maxDepth = 50, collapsed = true, style, ...props }) => {
  const truncatedSrc = useMemo(() => {
    return truncateValue(src, maxDepth);
  }, [maxDepth, src]);

  return (
    <JsonView
      value={truncatedSrc}
      collapsed={collapsed}
      enableClipboard={true}
      displayDataTypes={false}
      displayObjectSize={false}
      quotes=""
      style={style}
      {...props}
    />
  );
};
