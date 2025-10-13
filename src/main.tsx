import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "./app";

import type { router } from "@/app/router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

if (!rootElement) throw new Error("No root element found");

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
