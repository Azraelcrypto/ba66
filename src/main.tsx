import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Tron functionality
import EthereumApp from "./EthereumApp"; // Ethereum functionality
import "./styles/index.css"; // Shared styles

// Dynamically load Ethereum CSS if on Ethereum Network
const isEthereum = document.title === "Ethereum Network";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isEthereum ? <EthereumApp /> : <App />}
  </React.StrictMode>
);
