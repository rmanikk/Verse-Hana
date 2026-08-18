import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </AuthProvider>
  </StrictMode>
);