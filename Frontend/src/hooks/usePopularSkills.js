import { useQuery } from '@tanstack/react-query';
import { getPopularSkills } from '@/api/UserApi';

export const usePopularSkills = () => {
  return useQuery({
    queryKey: ['popular-skills'],
    queryFn: getPopularSkills,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
};