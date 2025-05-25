'use client';

import { Provider } from 'react-redux';
import store from '@/store/store';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import { useEffect } from 'react';

// Create socket instance outside React (global-like)
export const socket = io("http://localhost:5001", {
  auth: {
    token: typeof window !== 'undefined' ? localStorage.getItem("tokenHoYo") : null,
  },
  autoConnect: false, // We'll manually connect in `AppProviders`
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </Provider>
  );
}