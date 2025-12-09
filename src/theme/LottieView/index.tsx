import { memo } from 'react';

import Lottie from 'lottie-react';

import animations from '@/assets/animations';

type LottieViewProps = {
  source: keyof typeof animations;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

function LottieView(props: LottieViewProps) {
  const { source, width, height, ...otherProps } = props;
  const lottieAnimation = animations[source];

  if (lottieAnimation) {
    return <Lottie animationData={lottieAnimation} style={{ width, height }} {...otherProps} />;
  }

  return null;
}

export default memo(LottieView);
