'use client';
import React from 'react';

import { Box, Stack } from '@mui/material';

export type CarouselProps = {
  children: React.ReactNode;
  autoPlayMs?: number;
  loop?: boolean;
  showDots?: boolean;
  ariaLabel?: string;
};

export function Carousel({
  children,
  autoPlayMs = 5000,
  loop = true,
  showDots = true,
  ariaLabel = 'carousel',
}: CarouselProps) {
  const slides = React.Children.toArray(children);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const scrollToIndex = React.useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    container.scrollTo({ left: width * index, behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    if (!autoPlayMs || slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next < slides.length) {
          scrollToIndex(next);
          return next;
        }
        if (loop) {
          scrollToIndex(0);
          return 0;
        }
        return prev;
      });
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [autoPlayMs, loop, slides.length, scrollToIndex]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, clientWidth } = container;
      const index = Math.round(scrollLeft / Math.max(clientWidth, 1));
      if (index !== activeIndex) setActiveIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll as EventListener);
  }, [activeIndex]);

  return (
    <Stack gap={1} sx={{ width: '100%' }}>
      <Box
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        sx={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {slides.map((slide, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              flex: '0 0 100%',
              minWidth: '100%',
              scrollSnapAlign: 'start',
            }}
          >
            {slide}
          </Box>
        ))}
      </Box>

      {showDots && slides.length > 1 ? (
        <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
          {slides.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                cursor: 'pointer',
                bgcolor: idx === activeIndex ? 'text.primary' : 'text.disabled',
                opacity: idx === activeIndex ? 1 : 0.5,
              }}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
