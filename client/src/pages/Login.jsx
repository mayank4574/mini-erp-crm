import React, { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useHookForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl shadow-inner">
            <Boxes className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sign in to access your ERP portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg p-4 flex items-center">
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="admin@minierp.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-xs text-center text-slate-400 font-semibold tracking-wider uppercase mb-4">Demo Credentials</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">ADMIN</span>
                <span className="text-slate-600">admin@minierp.com</span>
              </div>
              <span className="text-slate-400 text-xs font-mono">password123</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">SALES</span>
                <span className="text-slate-600">sales@minierp.com</span>
              </div>
              <span className="text-slate-400 text-xs font-mono">password123</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700">WAREHOUSE</span>
                <span className="text-slate-600">warehouse@minierp.com</span>
              </div>
              <span className="text-slate-400 text-xs font-mono">password123</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-700">ACCOUNTS</span>
                <span className="text-slate-600">accounts@minierp.com</span>
              </div>
              <span className="text-slate-400 text-xs font-mono">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
