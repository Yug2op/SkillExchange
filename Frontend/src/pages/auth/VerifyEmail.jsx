import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/api/client'; // reuse axios instance

export default function VerifyEmail() {
  const [search] = useSearchParams();
  const token = search.get('token');
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async () => {
      // Backend expects POST /api/auth/verify-email?token=...
      const { data } = await api.post('/api/auth/verify-email', {}, { params: { token } });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Email verified!');
      navigate('/login');
    },
    onError: (err) => {
      toast.error(err?.message || 'Verification failed');
      navigate('/login');
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error('Missing token');
      navigate('/login');
      return;
    }
    mutate();
  }, [token, mutate, navigate]);

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Verifying your email…</h1>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}