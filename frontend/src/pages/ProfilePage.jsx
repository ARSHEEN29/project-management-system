import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardStats } from '../services/dashboardService.js';
import { CardSkeleton } from '../components/Skeleton.jsx';
import {
  User,
  Mail,
  Calendar,
  FolderKanban,
  CheckCircle2,
  ListTodo,
  ShieldAlert
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.summary || null);
      } catch (err) {
        console.error('Failed to retrieve user statistics for profile page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Profile Account</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your personal details and view your account statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Information Card */}
        <div className="glass-card p-6 md:p-8 lg:col-span-5 flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Avatar representation */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-3xl uppercase shadow-lg shadow-brand-500/20">
            {user?.fullName?.charAt(0) || 'U'}
          </div>

          <div className="space-y-1.5 w-full">
            <h2 className="text-xl font-bold">{user?.fullName || 'User'}</h2>
            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
          </div>

          <div className="w-full pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 text-left">
            {/* Full Name */}
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4.5 w-4.5 text-slate-450 shrink-0" />
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Full Name</p>
                <p className="font-semibold">{user?.fullName || 'Not Configured'}</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4.5 w-4.5 text-slate-450 shrink-0" />
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Email Address</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>

            {/* Registered date */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4.5 w-4.5 text-slate-450 shrink-0" />
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Registered Since</p>
                <p className="font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Account Statistics overview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="text-base font-bold">Workspace Stats Summary</h3>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Projects count */}
              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">
                  Total Projects
                </span>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold">{stats?.totalProjects || 0}</span>
                  <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Tasks count */}
              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-455 uppercase tracking-wide">
                  Total Tasks
                </span>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold">{stats?.totalTasks || 0}</span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                    <ListTodo className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Completed tasks count */}
              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">
                  Completed Tasks
                </span>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold">{stats?.tasksCompleted || 0}</span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security alerts placeholder */}
          <div className="glass-card p-6 flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Security Protection Active</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Your session is protected with modern JWT authentication. Plaintext passwords are encrypted on the database using bcrypt hashing. Do not share your sign-in details with third parties.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
