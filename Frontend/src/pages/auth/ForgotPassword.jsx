import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { forgotPassword } from '@/api/AuthApi';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  Send
} from 'lucide-react';
import { useState } from 'react';

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => forgotPassword(values),
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset email sent!');
      setIsSuccess(true);

    },
    onError: (err) => toast.error(err?.message || 'Failed to send reset email'),
  });

  const onSubmit = (values) => mutate(values);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email' },
                    })}
                  />
                </div>
                {errors.email && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.email.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending || isSubmitting}
                className="w-full h-12 text-base gap-2"
              >
                {isPending || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Check your email</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                If you don't see the email, check your spam folder or try again in a few minutes.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}