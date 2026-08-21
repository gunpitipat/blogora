import { createTheme, alpha } from '@mui/material/styles';

const textPrimary = '#181818';

const theme = createTheme({
  palette: {
    primary: {
      main: '#463f3a',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#8a817c',
      light: '#bcb8b1',
      dark: '#69615c',
    },
    success: {
      main: '#2f7a46',
    },
    error: {
      main: '#9e2a2b',
    },
    linkAccent: {
      main: '#543a14',
    },
    text: {
      primary: textPrimary,
      secondary: alpha(textPrimary, 0.7),
    },
    divider: '#aaaaaa',
    background: {
      default: '#fafafa',
      paper: '#f1f1f1',
    },
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
    fontSize: 16,
  },
  spacing: 8,
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
