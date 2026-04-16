import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ShopContextProvider } from '../context/shop-context';
import { WishlistContextProvider } from '../context/wishlist-context';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Alert from 'react-s-alert';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datetime/css/react-datetime.css";
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import '../App.css';

// Create a default theme for MUI components
const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488', // Consistent with the app's teal color
    },
    secondary: {
      main: '#f59e0b',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
});

const ThemeWrapper = ({ children }) => {
  return (
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <ShopContextProvider>
          <WishlistContextProvider>
            <div className="styleguide-wrapper" style={{ 
              padding: '40px', 
              background: '#f8fafc', 
              minHeight: '100vh',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                {children}
              </div>
            </div>
            <Alert stack={{ limit: 3 }} timeout={3000} position='top-right' effect='slide' offset={65} />
          </WishlistContextProvider>
        </ShopContextProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

export default ThemeWrapper;
