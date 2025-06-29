import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast/useToast';
import { useApi } from '@/lib/useApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { request } = useApi();
  const { isLoading } = useLoading();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await request<any>({
        method: 'POST',
        path: 'api/accounts/login',
        body: { identifier, password },
      });
      console.log('API Response:', result); // Log the API response

      if (result && result.account) {
        // The API returns the user data in an "account" property
        // and does not return a token. We'll pass the account data to the login function.
        login(result.account, ""); // Passing account data, token is not present in response
        toast({ title: 'Login successful!', variant: 'success' });
        // No longer navigating here, the useEffect will handle it
      } else {
        throw new Error('Invalid login response from server');
      }
    } catch (error: any) {
        toast({ title: 'Login Failed', description: error.message || 'An unknown error occurred.', variant: 'error' });
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Encompas E-Platform
            <br />
            A platform to manage health teleconsultation, data on pregnant women, and AI-supported tools for health attendants.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Username, Email, or Phone
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username, Email, or Phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={isLoading}>
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
