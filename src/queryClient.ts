import { QueryClient } from '@tanstack/react-query';
import { getErrorStatus } from './api/client';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount: number, error: unknown) => {
                const status = getErrorStatus(error);
                if (status === 401 || status === 403 || status === 404) {
                    return false;
                }

                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            staleTime: 60_000,
            gcTime: 5 * 60_000,
        },
    },
});

export default queryClient;
