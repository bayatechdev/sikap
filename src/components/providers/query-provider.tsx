'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { createQueryClient } from '@/lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [showDevtools, setShowDevtools] = useState(false);

  useEffect(() => {
    // Only show devtools in development and after client-side mount
    if (process.env.NODE_ENV === 'development') {
      setShowDevtools(true);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && (
        <DevtoolsComponent />
      )}
    </QueryClientProvider>
  );
}

// Separate component for devtools to avoid any SSR issues
function DevtoolsComponent() {
  const [Devtools, setDevtools] = useState<React.ComponentType<{ initialIsOpen: boolean }> | null>(null);

  useEffect(() => {
    // Dynamically import devtools only on client-side
    import('@tanstack/react-query-devtools')
      .then((mod) => {
        setDevtools(() => mod.ReactQueryDevtools);
      })
      .catch(() => {
        // Ignore import errors in production builds
      });
  }, []);

  if (!Devtools) return null;

  return <Devtools initialIsOpen={false} />;
}