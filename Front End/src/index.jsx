import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router } from 'react-router-dom';
import "react-datetime/css/react-datetime.css";
import {
  applyPolyfills,
  defineCustomElements,
} from "@goapptiv-code/bluedart-tracking-web-component/loader";

const root = ReactDOM.createRoot(document.getElementById("root"));

applyPolyfills().then(() => {
  defineCustomElements();
});
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);