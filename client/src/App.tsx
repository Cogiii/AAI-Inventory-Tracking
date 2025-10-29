import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from './router';
import { ErrorBoundary } from './components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-background font-sans antialiased">
          <RouterProvider router={router} />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
