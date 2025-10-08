import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/api/AuthApi';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => login(values),
    onSuccess: (res) => {
      toast.success(res.message || 'Login successful');
      // Update socket token (for Socket.io only)
      localStorage.setItem('socketToken', res?.data?.token || '');
      // Immediately update the cached current user so header updates without refresh
      if (res?.data?.user) {
        qc.setQueryData(['me'], res.data.user);
      } else {
        // Fallback: refetch me
        qc.invalidateQueries({ queryKey: ['me'] });
      }
      navigate('/');
    },
    onError: (err) => toast.error(err?.message || 'Login failed'),
  });

  const onSubmit = (values) => mutate(values);

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
            })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="w-full rounded-md bg-primary text-primary-foreground py-2.5 hover:opacity-90 disabled:opacity-60"
        >
          {isPending || isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="text-sm mt-2">
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        </div>
        <div className="text-sm mt-4">
          Don’t have an account? <Link to="/register" className="text-primary hover:underline">Create one</Link>
        </div>
      </form>
    </div>
  );
}