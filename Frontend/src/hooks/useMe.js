// Frontend/src/hooks/useMe.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/api/AuthApi';

export const useMe = () => {
    const qc = useQueryClient();
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await getMe(); // { success, data: { user } }
            return res?.data?.user || null;
        },
        retry: false, // avoid loops on 401
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnReconnect: 'always',
        refetchOnWindowFocus: false,
        onError: () => {
            // If /me fails (e.g., 401), ensure cached user is cleared
            qc.setQueryData(['me'], null);
        },
    });
};