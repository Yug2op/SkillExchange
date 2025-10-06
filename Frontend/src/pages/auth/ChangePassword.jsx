import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/api/AuthApi';
import { toast } from 'sonner';

export default function ChangePassword() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => changePassword({ currentPassword, newPassword }),
    onSuccess: (res) => toast.success(res.message || 'Password changed'),
    onError: (err) => toast.error(err?.message || 'Failed to change password'),
  });

  const onSubmit = (values) => {
    if (values.newPassword !== values.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    mutate({ currentPassword: values.currentPassword, newPassword: values.newPassword });
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Change Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Current Password</label>
          <input
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
          {errors.currentPassword && <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
          {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm New Password</label>
          <input
            type="password"
            {...register('confirm', { required: 'Please confirm your new password' })}
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
          {isPending || isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}