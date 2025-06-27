"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "react-hot-toast";
import io from "socket.io-client";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromStorage } from "@/store/authSlice";

// Create socket globally
export const socket = io("http://localhost:2000", {
  auth: {
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  },
  autoConnect: false,
});

// Split providers and app logic
function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // useEffect(() => {
  //   socket.connect();
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

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

// Main export wrapping redux store first
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ProvidersWrapper>{children}</ProvidersWrapper>
    </Provider>
  );
}
