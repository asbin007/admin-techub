"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromStorage } from "@/store/authSlice";


// Split providers and app logic
function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);


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
