'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function LoginForm({ signUpWithMicrosoft }: { signUpWithMicrosoft: () => Promise<string> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, error: authError, login, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Failed to sign in with Microsoft. Please try again.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await checkAuth();
        router.push('/dashboard');
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setError('Failed to complete sign-in. Please try again.');
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const redirectUrl = await signUpWithMicrosoft();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Microsoft login error:', error);
      setError('Failed to sign in with Microsoft. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in with Microsoft'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
