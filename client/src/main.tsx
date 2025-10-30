import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import App from "./App";
import "./index.css";

if (typeof window !== "undefined") {
  if (!window.location.hash || window.location.hash === "#") {
    window.location.replace(`${window.location.pathname}#/`);
  }
}

createRoot(document.getElementById("root")!).render(
  <WouterRouter hook={useHashLocation}>
    <App />
  </WouterRouter>
);
