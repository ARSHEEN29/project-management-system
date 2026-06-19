import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950 text-slate-100">
      {/* Background blobs for wow-factor dark aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Vanguard PMS
          </h1>
          <p className="mt-1 text-sm text-slate-400">Secure full-stack project dashboard</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
