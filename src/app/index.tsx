import { AppRouter } from "./app-router";
import { AppProvider } from "./provider";

import "./index.css";

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
