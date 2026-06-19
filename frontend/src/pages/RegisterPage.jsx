import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data.fullName, data.email, data.password);
      showToast('Registration successful! Welcome.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Registration failed, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Create a new account
        </h2>
        <p className="text-sm text-slate-400">
          Get started by filling out your details below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <User className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              disabled={loading}
              placeholder="John Doe"
              className={`input-field pl-10 border-slate-800 bg-slate-950/60 text-white placeholder-slate-600 focus:ring-brand-500/20 focus:border-brand-500 ${
                errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
              }`}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-semibold text-red-500">{errors.fullName.message}</p>
          )}
        </div>

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
              placeholder="john@example.com"
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
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Password
          </label>
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
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
                pattern: {
                  value: /(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
                  message: 'Must include at least one letter, number, and special character',
                }
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
              <span>Create Account</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
