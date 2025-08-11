"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithGoogle, getUserSession, isUserApproved } from '@/app/lib/auth';
import { FaCar } from 'react-icons/fa';

// Separate component that uses useSearchParams
function LoginContent() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error message in URL
    const errorCode = searchParams.get('error');
    if (errorCode) {
      const errorMessages: Record<string, string> = {
        'unauthorized': 'You are not authorized to access this application.',
        'no_company': 'No company found for your account. Please contact support.',
        'onboarding_required': 'Please complete your onboarding setup.',
        'session_expired': 'Your session has expired. Please sign in again.',
        'access_denied': 'Access denied. Please contact support if you believe this is an error.',
        'not_approved': 'Your account is pending approval. Please wait for administrator approval.'
      };
      setError(errorMessages[errorCode] || 'An unexpected error occurred. Please try again.');
    }

    const checkSession = async () => {
      const { session } = await getUserSession();

      if (session) {
        const { isApproved, error: approvalError } = await isUserApproved();

        if (approvalError) {
          setError(approvalError.message);
          return;
        }

        if (isApproved) {
          router.push('/dashboard');
        } else {
          router.push("/auth/pending");
        }
      }
    };

    checkSession();
  }, [router, searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // OAuth flow will redirect
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const handleTryDemo = () => {
    router.push("/login?demo=true");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1020] via-[#0C1226] to-[#0E1530] text-white">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/0 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#3B82F6] grid place-items-center shadow-[0_0_30px_rgba(59,130,246,0.35)]">
              <FaCar className="text-white" />
            </div>
            <span className="font-semibold tracking-wide text-white/90">DealerPro</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="px-4 py-2 rounded-lg bg-[#22C55E] text-[#0A0F1F] font-semibold hover:scale-[1.02] active:scale-[0.99] transition shadow-[0_10px_30px_-10px_rgba(34,197,94,0.6)]"
            >
              Try Demo
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute -top-[300px] -left-[200px] h-[600px] w-[600px] rounded-full bg-[#3B82F6]/10 blur-3xl" />
        <div className="absolute -bottom-[300px] -right-[200px] h-[600px] w-[600px] rounded-full bg-[#22C55E]/10 blur-3xl" />

        <div className="mx-auto max-w-md px-6 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)]"
          >
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl mx-auto grid place-items-center bg-[#3B82F6]/20 border border-white/10 shadow-[0_0_35px_rgba(59,130,246,0.25)]">
                <FaCar className="text-[#3B82F6] text-2xl" />
              </div>

              <h1 className="mt-4 text-2xl md:text-3xl font-bold">Welcome back</h1>
              <p className="mt-2 text-white/70">Sign in to continue to your account</p>

              {error && (
                <div className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition disabled:opacity-70"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                    </g>
                  </svg>
                  <span className="font-medium">{googleLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={handleTryDemo}
                  className="w-full rounded-xl px-4 py-3 bg-[#22C55E] text-[#0A0F1F] font-semibold hover:scale-[1.02] active:scale-[0.99] transition shadow-[0_10px_30px_-10px_rgba(34,197,94,0.6)]"
                >
                  Try Demo
                </button>
              </div>

              <p className="mt-6 text-xs text-white/60">
                Protected by Supabase Auth. Company data is isolated per tenant.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Loading component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1020] via-[#0C1226] to-[#0E1530] grid place-items-center p-4 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 w-full max-w-md">
        <div className="flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
