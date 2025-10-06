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
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
    });
  };