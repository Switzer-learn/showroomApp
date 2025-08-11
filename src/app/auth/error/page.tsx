"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function AuthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1020] via-[#0C1226] to-[#0E1530] text-white">
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <FaExclamationTriangle className="h-8 w-8 text-rose-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-white/70 mb-6">
            Something went wrong during the authentication process. Please try signing in again.
          </p>
          
          <button
            onClick={() => router.push('/login')}
            className="rounded-xl bg-[#3B82F6] px-6 py-3 font-semibold text-white hover:bg-[#3B82F6]/90 transition"
          >
            Return to Login
          </button>
          
          <p className="mt-4 text-sm text-white/50">
            Redirecting to login in 5 seconds...
          </p>
        </div>
      </div>
    </main>
  );
}