export const colorSchemes = {
  light: {
    palette: {
      transparent: 'rgba(255, 255, 255, 0)',
      // Danishgah-e-Ramzan brand (decided 14 Nov 2026), shared with the staff app: deep green,
      // gold for ornament and highlights (goldText where gold must be read), ivory surfaces.
      primary: {
        main: '#0F4D3A',
        light: '#1D6B52',
        dark: '#0A3528',
        contrastText: '#FFFFFF',
      },
      // The readable gold: focus rings and the odd highlight button. White text on it is 5.6:1.
      secondary: {
        main: '#8A6416',
        light: '#B8892B',
        dark: '#6B4D0F',
        contrastText: '#FFFFFF',
      },
      brand: {
        green: '#0F4D3A',
        gold: '#B8892B',
        goldText: '#8A6416',
        goldSoft: 'rgba(184, 137, 43, 0.12)',
        ivory: '#FAF6EC',
      },
      grey: {
        50: '#FFFFFF',
        100: '#F8F8F8',
        200: '#F0F0F0',
        300: '#E0E0E0',
        400: '#D3D3D3',
        500: '#C0C0C0',
        600: '#B0B0B0',
        700: '#A9A9A9',
        800: '#909090',
        900: '#808080',
      },
      background: {
        default: '#FAF6EC',
        paper: '#FFFFFF',
      },
      common: { black: '#000000', white: '#FFFFFF' },
      stroke: '#E6DECB',
      text: {
        primary: '#1E2B25',
        secondary: '#55635B',
      },
      general_main: {
        1: '#FDFDFD',
        2: '#E7F0EB',
        3: '#F3F7F4',
      },
      error: {
        main: '#D32F2F',
        light: '#EF5350',
        dark: '#C62828',
      },
      // Brighter and yellower than the primary green, so a success never looks like a button.
      success: {
        main: '#33802A',
        light: '#5DAA4F',
        dark: '#25611E',
      },
      warning: {
        main: '#ED6C02',
        light: '#FF9800',
        dark: '#E65100',
      },
      info: {
        main: '#0288D1',
        light: '#03A9F4',
        dark: '#01579B',
      },
      gradient_blue: {
        1: '#001B2F',
        2: '#005597',
      },
      gradient_yellow: {
        1: 'rgba(236, 248, 127, 0.3)',
      },
    },
  },
  dark: {
    palette: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: {
        main: '#4CAF86',
        light: '#7CC9A8',
        dark: '#0F4D3A',
        contrastText: '#08130E',
      },
      secondary: {
        main: '#D4AE5F',
        light: '#E2C583',
        dark: '#B8892B',
        contrastText: '#08130E',
      },
      brand: {
        green: '#0F4D3A',
        gold: '#D4AE5F',
        goldText: '#E2C583',
        goldSoft: 'rgba(212, 174, 95, 0.14)',
        ivory: '#FAF6EC',
      },
      grey: {
        50: '#101010',
        100: '#202020',
        200: '#282828',
        300: '#303030',
        400: '#383838',
        500: '#404040',
        600: '#484848',
        700: '#505050',
        800: '#606060',
        900: '#696969',
      },
      background: {
        default: '#08130E',
        paper: '#0F2119',
      },
      common: { black: '#000000', white: '#FFFFFF' },
      stroke: '#1E3A2D',
      text: {
        primary: '#E8EFEA',
        secondary: '#A0B3A8',
      },
      general_main: {
        1: '#1A1A1A',
        2: '#123326',
        3: '#0B1A13',
      },
      error: {
        main: '#D32F2F',
        light: '#EF5350',
        dark: '#C62828',
      },
      success: {
        main: '#6CC05A',
        light: '#8FD37F',
        dark: '#33802A',
      },
      warning: {
        main: '#ED6C02',
        light: '#FF9800',
        dark: '#E65100',
      },
      info: {
        main: '#0288D1',
        light: '#03A9F4',
        dark: '#01579B',
      },
      gradient_blue: {
        1: '#001B2F',
        2: '#005597',
      },
      gradient_yellow: {
        1: 'rgba(236, 248, 127, 0.6)',
      },
    },
  },
};
