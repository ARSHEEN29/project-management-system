import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect path after login (either where they came from or dashboard root)
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      showToast('Welcome back! Login successful.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="text-sm text-slate-400">
          Enter your email and password to enter the system
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Mail className="h-4.5 w-4.5" />
            </span>
            <input
              type="email"
              disabled={loading}
              placeholder="name@example.com"
              className={`input-field pl-10 border-slate-800 bg-slate-950/60 text-white placeholder-slate-600 focus:ring-brand-500/20 focus:border-brand-500 ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
              }`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Password
            </label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Lock className="h-4.5 w-4.5" />
            </span>
            <input
              type="password"
              disabled={loading}
              placeholder="••••••••"
              className={`input-field pl-10 border-slate-800 bg-slate-950/60 text-white placeholder-slate-600 focus:ring-brand-500/20 focus:border-brand-500 ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
              }`}
              {...register('password', {
                required: 'Password is required',
              })}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-2 py-3 inline-flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
