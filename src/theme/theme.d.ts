/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Color {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  }

  type PartialColor = Partial<Color>;

  /** Brand colors. Gold is for the logo and ornament only; use goldText where gold must be read. */
  interface BrandPalette {
    navy: string;
    gold: string;
    goldText: string;
    goldSoft: string;
  }

  interface Palette {
    neutral: PartialColor;
    brand: BrandPalette;
  }

  interface PaletteOptions {
    neutral?: PartialColor;
    brand?: BrandPalette;
  }

  interface TypeBackground {
    level1: string;
    level2: string;
    level3: string;
  }

  interface Theme {
    // Add custom properties here if needed
  }

  interface ThemeOptions {
    // Add custom properties here if needed
  }
}
