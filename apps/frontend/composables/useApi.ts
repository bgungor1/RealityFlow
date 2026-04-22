import type { UseFetchOptions } from 'nuxt/app';

export function useApi<T>(url: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig();

  return useFetch(url, {
    baseURL: config.public.apiBase as string,
    ...options,
  });
}
