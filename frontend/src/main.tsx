window.global = window;
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./components/store/store.ts";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { LocaleProvider } from "./lib/LocaleProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <LocaleProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontSize: "14px",
            },
          }}
        />
        </LocaleProvider>
    </Provider>
  </StrictMode>
);
