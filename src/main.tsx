// main index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "../src/components/ui/provider";
import FloatingPopupManager from "./component/FloatingPopupManager";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <App />
      <FloatingPopupManager />
    </Provider>
  </React.StrictMode>
);
