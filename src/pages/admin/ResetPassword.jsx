import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { FiLock, FiUser, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useAlert } from '../../context/AlertContext';

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { success } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    // Check if we have a valid reset token in the URL
    const checkToken = async () => {
      try {
        // Check if there's a token in the URL hash first
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (accessToken && type === 'recovery') {
          // Token exists in URL, Supabase will process it automatically
          // Wait a moment for Supabase to process the token
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if session was created after token processing
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setIsValidToken(true);
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        } else {
          // Check if user already has a session (maybe they're already logged in)
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsValidToken(true);
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      } catch (err) {
        console.error('Error checking token:', err);
        setError('Error validating reset link. Please try again.');
      } finally {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Update the password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        setPasswordReset(true);
        success('Password has been reset successfully!');
        setLoading(false);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
                <FiUser className="text-red-600 dark:text-red-400 text-4xl" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Invalid Reset Link</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              <button
                onClick={() => navigate('/admin/login')}
                className="btn-primary"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
              <FiCheckCircle className="text-green-600 dark:text-green-400 text-4xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password Reset Successful!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-600 rounded-2xl mb-4">
            <FiLock className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || 'Passwords do not match',
                  })}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
