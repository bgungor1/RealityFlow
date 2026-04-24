export const useApiFetch = async <T>(url: string, options: any = {}) => {
  const config = useRuntimeConfig();
  return $fetch<T>(url, {
    baseURL: config.public.apiBase as string,
    ...options,
  });
};
