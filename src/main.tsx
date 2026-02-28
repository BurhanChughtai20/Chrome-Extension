import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "../src/components/ui/provider";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider>
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
