import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/api/client';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Icons
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  Send,
  AtSign
} from 'lucide-react';

export default function VerifyEmail() {
  const [search] = useSearchParams();
  const token = search.get('token');
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [showResendForm, setShowResendForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/auth/verify-email', {}, { params: { token } });
      return data;
    },
    onSuccess: (res) => {
      setVerificationStatus('success');
      toast.success(res.message || 'Email verified successfully!');
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000); // Go to home instead of login
    },
    onError: (err) => {
      setVerificationStatus('error');
      toast.error(err?.message || 'Email verification failed');
    },
  });

  const { mutate: resendVerification, isPending: resendPending } = useMutation({
    mutationFn: async (email) => {
      const { data } = await api.post('/api/auth/resend-verification', { email });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Verification email sent!');
      setShowResendForm(false);
    },
    onError: (err) => toast.error(err?.message || 'Failed to send verification email'),
  });

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      toast.error('Missing verification token');
      return;
    }
    mutate();
  }, [token, mutate]);

  const handleRetry = () => {
    setVerificationStatus('verifying');
    mutate();
  };

  const handleResendVerification = (email) => {
    resendVerification(email);
  };

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
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Mail className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Email Verification</h1>
          <p className="text-muted-foreground">We're confirming your email address to secure your account</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="space-y-6">
            {/* Verification Status */}
            {verificationStatus === 'verifying' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Verifying your email...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please wait while we confirm your email address
                  </p>
                </div>
              </motion.div>
            )}

            {verificationStatus === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Email Verified!</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Your email has been successfully verified
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Welcome to SkillExchange! You can now start exchanging skills.
                  </p>
                </div>
              </motion.div>
            )}

            {verificationStatus === 'error' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Verification Failed</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    The verification link is invalid or has expired
                  </p>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleRetry} disabled={isPending} className="w-full gap-2">
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                      </>
                    )}
                  </Button>

                  {!showResendForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowResendForm(true)}
                      className="w-full gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Request New Verification Email
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AtSign className="h-4 w-4" />
                        Enter your email address
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const email = e.target.email.value;
                          if (email) {
                            handleResendVerification(email);
                          }
                        }}
                        className="space-y-2"
                      >
                        <Input
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={resendPending} size="sm" className="flex-1">
                            {resendPending ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-2" />
                                Send Email
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResendForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <Button variant="outline" asChild className="w-full gap-2">
                    <a href="/login">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </a>
                  </Button>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    If you continue having issues, please contact support or try requesting a new verification email.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        {isSuccess &&(<motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Check your email</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              If verification takes longer than expected, check your spam folder or request a new verification email.
            </p>
          </div>
        </motion.div>)}
      </motion.div>
    </div>
  );
}