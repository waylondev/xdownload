import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});