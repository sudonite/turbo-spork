import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProfileProvider } from "@/contexts/ProfileContext";

import { Toaster } from "@/components/ui/toaster";
import router from "./Routes";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <ProfileProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ProfileProvider>
  </ThemeProvider>
);
