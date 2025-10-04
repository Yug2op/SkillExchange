import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { register as registerApi } from '@/api/AuthApi';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', skillsToTeach: '', skillsToLearn: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        skillsToTeach: values.skillsToTeach
          ? values.skillsToTeach.split(',').map((s) => s.trim()).filter(Boolean) : [],
        skillsToLearn: values.skillsToLearn
          ? values.skillsToLearn.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      return registerApi(payload);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Registration successful. Check email to verify.');
      navigate('/login');
    },
    onError: (err) => toast.error(err?.message || 'Registration failed'),
  });

  const onSubmit = (values) => mutate(values);

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Min 2 characters' },
              maxLength: { value: 50, message: 'Max 50 characters' },
            })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Your name"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

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
          <label className="block text-sm mb-1">Skills to Teach (comma-separated)</label>
          <input
            {...register('skillsToTeach')}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g., JavaScript, Cooking"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Skills to Learn (comma-separated)</label>
          <input
            {...register('skillsToLearn')}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g., Spanish, Guitar"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="w-full rounded-md bg-primary text-primary-foreground py-2.5 hover:opacity-90 disabled:opacity-60"
        >
          {isPending || isSubmitting ? 'Creating...' : 'Create account'}
        </button>

        <div className="text-sm mt-4">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}