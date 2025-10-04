import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '@/api/AuthApi';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => forgotPassword({ email: values.email }),
    onSuccess: (res) => toast.success(res.message || 'Password reset email sent'),
    onError: (err) => toast.error(err?.message || 'Failed to send reset email'),
  });

  const onSubmit = (values) => mutate(values);

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Forgot Password</h1>
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

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="w-full rounded-md bg-primary text-primary-foreground py-2.5 hover:opacity-90 disabled:opacity-60"
        >
          {isPending || isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}