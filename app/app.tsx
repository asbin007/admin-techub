'use client';

import { Provider } from 'react-redux';
import store from '@/store/store';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'react-hot-toast';
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      ><Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
