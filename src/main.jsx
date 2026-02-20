import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../art-auction-app.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
