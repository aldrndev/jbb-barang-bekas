'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 menit: data fresh di memori (tidak membebani API saat bolak-balik klik link)
            gcTime: 15 * 60 * 1000, // 15 menit: cache disimpan di Garbage Collection memory
            refetchOnMount: false, // Gunakan cache instan selama data masih fresh
            refetchOnWindowFocus: false, // Hindari request otomatis saat user ganti tab browser
            retry: 1
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
