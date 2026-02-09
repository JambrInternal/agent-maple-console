import { useQuery } from '@tanstack/react-query';

/**
 * useApiQuery - A reusable hook for API requests with caching, retries, and error handling.
 *
 * @param {string|Array} key - Unique query key (string or array for params)
 * @param {Function} fetcher - Async function to fetch data
 * @param {Object} options - Optional: overrides for caching, retries, etc.
 * @returns {Object} - { data, error, isLoading, isFetching, refetch, ... }
 */
export function useApiQuery(key, fetcher, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: fetcher,
    staleTime: options.staleTime ?? 60 * 1000, // 1 minute default
    cacheTime: options.cacheTime ?? 5 * 60 * 1000, // 5 minutes default
    retry: options.retry ?? 2, // Retry failed requests twice by default
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    ...options,
  });
}
