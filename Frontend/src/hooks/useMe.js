// Frontend/src/hooks/useMe.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/api/AuthApi';

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await getMe();
      return res?.data?.user || null;
    },
    retry: 3, // Reduce retry attempts
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (was 0)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (was 5)
  });
};