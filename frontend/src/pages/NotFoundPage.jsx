import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
      <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center shadow-lg">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">404 — Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          The resource you are looking for has been moved, renamed, or is restricted from your access level.
        </p>
      </div>

      <Link
        to="/"
        className="btn-primary inline-flex items-center gap-2 py-3 px-6"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
