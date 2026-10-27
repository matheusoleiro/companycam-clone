'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/primitives/button';
import { getStrings } from '@/i18n/strings';

const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'contractor@example.com';
const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'password123';
const strings = getStrings('pt');

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState(demoPassword);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError('No session created. Please try again.');
        setLoading(false);
        return;
      }

      // Login successful - redirect to projects
      router.push('/projects');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {/* Logo / Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">CompanyCam</h1>
          <p className="mt-2 text-base text-slate-600 font-medium">Field documentation made simple</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              placeholder={demoEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-8"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 border-t border-slate-200 pt-6">
          <p className="font-medium">Demo credentials:</p>
          <p className="text-xs mt-2">Email: <code className="bg-slate-100 px-2 py-1 rounded">{demoEmail}</code></p>
          <p className="text-xs">Password: <code className="bg-slate-100 px-2 py-1 rounded">{demoPassword}</code></p>
        </div>
      </div>
    </div>
  );
}
