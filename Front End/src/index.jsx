import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router } from 'react-router-dom';
import "react-datetime/css/react-datetime.css";
import {
  applyPolyfills,
  defineCustomElements,
} from "@goapptiv-code/bluedart-tracking-web-component/loader";
import ThemeWrapper from './styleguide/ThemeWrapper';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById("root"));

// Suppress ReactDOM.render warning from legacy third-party libraries (like react-s-alert)
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ReactDOM.render is no longer supported in React 18')) {
    return;
  }
  originalError.apply(console, args);
};

applyPolyfills().then(() => {
  defineCustomElements();
});

const helmetContext = {};

root.render(
  <Router>
    <ThemeWrapper>
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    </ThemeWrapper>
  </Router>
);

