import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    linkAccent: Palette['primary'];
  }

  interface PaletteOptions {
    linkAccent?: PaletteOptions['primary'];
  }
}
