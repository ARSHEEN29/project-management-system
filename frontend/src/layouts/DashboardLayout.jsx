import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully.', 'success');
      navigate('/login');
    } catch (err) {
      showToast('Logout failed, please try again.', 'error');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: ListTodo },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-[#080b11] dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60 sticky top-0 h-screen">
        {/* Brand Logo header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400 dark:from-white dark:to-slate-400">
            Vanguard PMS
          </span>
        </div>

        {/* Sidebar menu items */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile and Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
          {/* User profile capsule */}
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white uppercase shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Drawer body */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 p-5 z-10 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-extrabold text-base">Vanguard PMS</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center gap-3 py-1">
                <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white uppercase">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                  {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 p-2 px-3 text-xs font-semibold text-rose-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm md:text-base font-semibold text-slate-500 dark:text-slate-400">
              Overview
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                Authenticated Account
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white uppercase text-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden md:block">
                {user?.fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page main content output */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
