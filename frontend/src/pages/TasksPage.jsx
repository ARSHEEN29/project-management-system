import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTasks, updateTask, deleteTask, exportTasksCsv } from '../services/taskService.js';
import { getAllProjects } from '../services/projectService.js';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  CheckCircle,
  FileDown,
  Trash2,
  Edit2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ListTodo
} from 'lucide-react';

export const TasksPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state (Backend-Driven Filtering)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  // Delete task modal state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch projects list (for project selector dropdown)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects({ limit: 100 });
        setProjects(response.data || []);
      } catch (err) {
        console.error('Failed to load projects list in tasks filter dropdown:', err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks list
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTasks({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        projectId: projectFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 8
      });
      setTasks(response.data || []);
      setPagination(response.pagination || { totalPages: 1, totalItems: 0 });
    } catch (err) {
      showToast(err.message || 'Failed to retrieve tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, projectFilter, sortBy, sortOrder, page, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page when filters change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value);
    setPage(1);
  };

  const handleProjectFilterChange = (e) => {
    setProjectFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value.split(':');
    setSortBy(val[0]);
    setSortOrder(val[1]);
    setPage(1);
  };

  // Toggle complete inline status change
  const handleToggleTaskComplete = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTask(task.id, { status: nextStatus, projectId: task.projectId });
      showToast(`Task "${task.name}" marked as ${nextStatus.toLowerCase()}.`, 'success');
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // Delete task triggers
  const triggerDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      showToast(`Task "${taskToDelete.name}" deleted successfully.`, 'success');
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    } finally {
      setTaskToDelete(null);
    }
  };

  // Bulk CSV export
  const handleExportCsv = async () => {
    try {
      showToast('Generating CSV report...', 'info');
      await exportTasksCsv({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        projectId: projectFilter || undefined
      });
      showToast('CSV downloaded successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to export CSV.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Tasks Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Global task list across all workspace projects.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            disabled={tasks.length === 0}
            className="btn-secondary py-2 text-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            <FileDown className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/tasks/create')}
            className="btn-primary shrink-0 inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
        
        {/* Search */}
        <div className="relative lg:col-span-4">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search tasks by name..."
            value={search}
            onChange={handleSearchChange}
            className="input-field pl-10"
          />
        </div>

        {/* Project Selector */}
        <div className="relative lg:col-span-2">
          <select
            value={projectFilter}
            onChange={handleProjectFilterChange}
            className="input-field appearance-none cursor-pointer text-ellipsis overflow-hidden"
          >
            <option value="">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="h-4 w-4" />
          </span>
        </div>

        {/* Status Filter */}
        <div className="relative lg:col-span-2">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative lg:col-span-2">
          <select
            value={priorityFilter}
            onChange={handlePriorityFilterChange}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Sorting option */}
        <div className="relative lg:col-span-2">
          <select
            onChange={handleSortChange}
            value={`${sortBy}:${sortOrder}`}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="createdAt:desc">Newest Created</option>
            <option value="createdAt:asc">Oldest Created</option>
            <option value="dueDate:asc">Due Date (Earliest)</option>
            <option value="name:asc">Name (A-Z)</option>
            <option value="priority:desc">Priority (High-Low)</option>
          </select>
        </div>

      </div>

      {/* Table list */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : tasks.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  task.status === 'COMPLETED' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Mark complete inline checkmark circle */}
                  <button
                    onClick={() => handleToggleTaskComplete(task)}
                    className={`mt-0.5 shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-brand-500'
                    }`}
                  >
                    {task.status === 'COMPLETED' && <CheckCircle className="h-4.5 w-4.5" />}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`font-bold text-sm truncate ${
                        task.status === 'COMPLETED' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.name}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {task.project?.name || 'Project'}
                      </span>
                      <span className="text-slate-350 dark:text-slate-700 text-[10px]">•</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>Due: {task.dueDate ? task.dueDate.split('T')[0] : 'No due date'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges and commands */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className="flex gap-2">
                    {/* Priority label */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.priority === 'HIGH'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => triggerDelete(task)}
                      className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination bar controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">
                Showing Page {page} of {pagination.totalPages} ({pagination.totalItems} total tasks)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No tasks found"
          description="Create a task milestone to populate the dashboard metrics."
          actionText="Create Task"
          onActionClick={() => navigate('/tasks/create')}
          icon={ListTodo}
        />
      )}

      {/* Delete confirmation check */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete the task "${taskToDelete?.name}"? This action cannot be undone.`}
      />

    </div>
  );
};

export default TasksPage;
