"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import store from "@/store/store";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "react-hot-toast";
import io from "socket.io-client";

// ✅ Import `io` and create socket instance
export const socket= io("http://localhost:2000", {
  auth: {
    token:
      typeof window !== "undefined" ? localStorage.getItem("token") : null,
  },
  autoConnect: false, // Prevent auto-connect before manual trigger
});

// ✅ Theme, Toaster, etc.
function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster position="top-right" />
      {children}
    </ThemeProvider>
  );
}

// ✅ Connect/disconnect socket once on client mount
export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <ProvidersWrapper>{children}</ProvidersWrapper>
    </Provider>
  );
}
