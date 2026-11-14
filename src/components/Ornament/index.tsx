'use client';

import type { JSX } from 'react';

import Box from '@mui/material/Box';

/**
 * The khatam: an 8-point star made of two squares, one turned 45°.
 * Points alternate between the outer radius and the inner one where the squares' edges cross.
 */
function khatamPoints(cx: number, cy: number, outer: number): string {
  const inner = (outer * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
  return Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

export interface KhatamStarProps {
  /** CSS size of the star's box. */
  size?: number;
  color?: string;
  /** Outline only (the default) or filled. */
  filled?: boolean;
}

/** One 8-point star, for dividers and small accents. */
export function KhatamStar({ size = 14, color = 'currentColor', filled = false }: KhatamStarProps): JSX.Element {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      sx={{ width: size, height: size, flexShrink: 0 }}
    >
      <polygon
        points={khatamPoints(12, 12, 11)}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.4}
        strokeLinejoin="round"
      />
    </Box>
  );
}

/** A short rule with a star in the middle: — ✦ — */
export function KhatamDivider({ color, width = 120 }: { color: string; width?: number }): JSX.Element {
  const line = { flex: 1, height: '1px', bgcolor: color, opacity: 0.6 };
  return (
    <Box aria-hidden sx={{ display: 'flex', alignItems: 'center', gap: 1, width }}>
      <Box sx={line} />
      <KhatamStar size={12} color={color} filled />
      <Box sx={line} />
    </Box>
  );
}

/**
 * A repeating lattice of outlined stars as a CSS background, e.g. `sx={{ backgroundImage: khatamPattern('#B8892B', 0.1) }}`.
 * Keep the opacity low: it's texture, not decoration to look at.
 */
export function khatamPattern(color: string, opacity = 0.1, tile = 56): string {
  const half = tile / 2;
  const star = (cx: number, cy: number) =>
    `<polygon points='${khatamPoints(cx, cy, tile * 0.3)}' fill='none' stroke='${color}' stroke-opacity='${opacity}' stroke-width='1'/>`;
  // Stars at the centre and the four corners, so the tiles join into a lattice.
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>${star(half, half)}${star(0, 0)}${star(tile, 0)}${star(0, tile)}${star(tile, tile)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * A thin band of small stars joined by short rules (✦—✦—), as a CSS background repeated along x.
 * For the gold band under the top bar.
 */
export function khatamBand(color: string, height = 10, step = 28): string {
  const mid = height / 2;
  const star = `<polygon points='${khatamPoints(step / 2, mid, height * 0.36)}' fill='${color}'/>`;
  const rule = `<line x1='${step / 2 + height * 0.55}' y1='${mid}' x2='${step + step / 2 - height * 0.55}' y2='${mid}' stroke='${color}' stroke-width='1' stroke-opacity='0.8'/>`;
  const leftRule = `<line x1='0' y1='${mid}' x2='${step / 2 - height * 0.55}' y2='${mid}' stroke='${color}' stroke-width='1' stroke-opacity='0.8'/>`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${step}' height='${height}'>${leftRule}${star}${rule}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
