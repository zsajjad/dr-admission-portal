export const colorSchemes = {
  light: {
    palette: {
      transparent: 'rgba(255, 255, 255, 0)',
      // Danishgah-e-Ramzan brand, the same tokens as the public website: navy, a lapis accent,
      // and gold for the logo and ornament only (never for text: 2.97:1 on white).
      primary: {
        main: '#0B2A63',
        light: '#133A84',
        dark: '#0A1631',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#2152CC',
        light: '#6D96FF',
        dark: '#173C99',
        contrastText: '#FFFFFF',
      },
      brand: {
        navy: '#0B2A63',
        gold: '#B0892C',
        goldText: '#8A6A1F',
        goldSoft: 'rgba(184, 144, 47, 0.1)',
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
        default: '#FFFFFF',
        paper: '#FAFBFD',
      },
      common: { black: '#000000', white: '#FFFFFF' },
      stroke: '#E1E7F1',
      text: {
        primary: '#0A1631',
        secondary: '#55647E',
      },
      general_main: {
        1: '#FDFDFD',
        2: '#EAF0FF',
        3: '#F5F7FB',
      },
      error: {
        main: '#D32F2F',
        light: '#EF5350',
        dark: '#C62828',
      },
      success: {
        main: '#2E7D32',
        light: '#4CAF50',
        dark: '#1B5E20',
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
        main: '#2A64F6',
        light: '#6D96FF',
        dark: '#0B2A63',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#6D96FF',
        light: '#A9C1FF',
        dark: '#2152CC',
        contrastText: '#01040C',
      },
      brand: {
        navy: '#0B2A63',
        gold: '#D4B36A',
        goldText: '#E2C583',
        goldSoft: 'rgba(212, 179, 106, 0.12)',
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
        default: '#01040C',
        paper: '#08132C',
      },
      common: { black: '#000000', white: '#FFFFFF' },
      stroke: '#152448',
      text: {
        primary: '#E6ECF8',
        secondary: '#8A9ABA',
      },
      general_main: {
        1: '#1A1A1A',
        2: '#0D1D45',
        3: '#050D21',
      },
      error: {
        main: '#D32F2F',
        light: '#EF5350',
        dark: '#C62828',
      },
      success: {
        main: '#2E7D32',
        light: '#4CAF50',
        dark: '#1B5E20',
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
