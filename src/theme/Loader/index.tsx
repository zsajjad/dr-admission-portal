'use client';

import { Overlay } from './Styled';

interface IOverlayLoaderProps {
  size?: number;
}

export default function OverlayLoader({}: IOverlayLoaderProps) {
  return <Overlay></Overlay>;
}
