import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datetime/css/react-datetime.css";
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import '../App.css';

// Global Design System Colors
export const themeColors = {
  primary: '#42C269',
  secondary: '#43BCC1',
  text: '#212121',
  background: '#fff',
  primaryHover: '#359c55'
};

// Inject CSS variables into the document globally
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--color-primary', themeColors.primary);
  document.documentElement.style.setProperty('--color-secondary', themeColors.secondary);
  document.documentElement.style.setProperty('--color-text', themeColors.text);
  document.documentElement.style.setProperty('--color-bg', themeColors.background);
  document.documentElement.style.setProperty('--color-primary-hover', themeColors.primaryHover);
}

// Create a default theme for MUI components
const theme = createTheme({
  palette: {
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.secondary,
    },
    text: {
      primary: themeColors.text,
    },
    background: {
      default: themeColors.background,
      paper: themeColors.background,
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
});

const ThemeWrapper = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;
