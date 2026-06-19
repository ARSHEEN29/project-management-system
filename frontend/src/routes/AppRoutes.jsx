import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Route Guard
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Pages
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ProjectsPage from '../pages/ProjectsPage.jsx';
import CreateProjectPage from '../pages/CreateProjectPage.jsx';
import ProjectDetailsPage from '../pages/ProjectDetailsPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import CreateTaskPage from '../pages/CreateTaskPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest/Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated Workspace routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/create" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/projects/:id/edit" element={<CreateProjectPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/create" element={<CreateTaskPage />} />
        <Route path="/tasks/:id/edit" element={<CreateTaskPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Catch-all redirects */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
