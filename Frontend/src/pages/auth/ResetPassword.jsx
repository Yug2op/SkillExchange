import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/api/AuthApi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Missing token');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { password: '', confirm: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => resetPassword({ token, password: values.password }),
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset successful');
      navigate('/login');
    },
    onError: (err) => toast.error(err?.message || 'Failed to reset password'),
  });

  const onSubmit = (values) => {
    if (values.password !== values.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    mutate(values);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input
            type="password"
            {...register('confirm', { required: 'Please confirm your password' })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
          {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="w-full rounded-md bg-primary text-primary-foreground py-2.5 hover:opacity-90 disabled:opacity-60"
        >
          {isPending || isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}