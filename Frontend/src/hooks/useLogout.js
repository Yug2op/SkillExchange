// Frontend/src/hooks/useLogout.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/api/AuthApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useLogout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: (res) => {
      localStorage.removeItem('socketToken');
      // Immediately clear cached current user so header updates without refresh
      qc.setQueryData(['me'], null);
      // Then refetch to confirm session state
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(res.message || 'Logged out');
      navigate('/login');
    },
  });
}