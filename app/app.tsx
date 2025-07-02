"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "react-hot-toast";


// Split providers and app logic
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

// Main export wrapping redux store first
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ProvidersWrapper>{children}</ProvidersWrapper>
    </Provider>
  );
}
