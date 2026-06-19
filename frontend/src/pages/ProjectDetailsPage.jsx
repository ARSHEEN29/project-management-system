import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjectById, deleteProject } from '../services/projectService.js';
import { updateTask, deleteTask } from '../services/taskService.js';
import { exportTasksCsv } from '../services/taskService.js';
import { useToast } from '../context/ToastContext.jsx';
import { ConfirmationModal } from '../components/ConfirmationModal.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  ChevronLeft,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  FileDown,
  Clock,
  AlertCircle,
  FolderKanban,
  CheckSquare
} from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for tasks (Client-Side Filtering)
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  // Modals confirmation
  const [showProjDeleteModal, setShowProjDeleteModal] = useState(false);
  
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showTaskDeleteModal, setShowTaskDeleteModal] = useState(false);

  // Fetch project details
  const fetchProjectDetails = useCallback(async () => {
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      showToast(err.message || 'Failed to retrieve project details.', 'error');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Client-Side Task Filter Computation
  const filteredTasks = useMemo(() => {
    if (!project || !project.tasks) return [];
    
    return project.tasks.filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(taskSearch.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(taskSearch.toLowerCase()));
      const matchesStatus = !taskStatusFilter || task.status === taskStatusFilter;
      const matchesPriority = !taskPriorityFilter || task.priority === taskPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [project, taskSearch, taskStatusFilter, taskPriorityFilter]);

  // Project Actions handlers
  const handleDeleteProject = async () => {
    try {
      await deleteProject(id);
      showToast('Project deleted successfully.', 'success');
      navigate('/projects');
    } catch (err) {
      showToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  // Task inline actions handlers
  const handleToggleTaskComplete = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTask(task.id, { status: nextStatus, projectId: parseInt(id) });
      showToast(`Task "${task.name}" marked as ${nextStatus.toLowerCase().replace('_', ' ')}.`, 'success');
      fetchProjectDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  const triggerDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowTaskDeleteModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      showToast(`Task "${taskToDelete.name}" was deleted successfully.`, 'success');
      fetchProjectDetails();
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    } finally {
      setTaskToDelete(null);
    }
  };

  // CSV export handler
  const handleExportCsv = async () => {
    try {
      showToast('Preparing CSV download...', 'info');
      await exportTasksCsv({ projectId: id });
      showToast('CSV downloaded successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to export tasks to CSV.', 'error');
    }
  };

  if (loading) {
    return <TableSkeleton rows={4} />;
  }

  if (!project) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/projects"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold w-fit"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/projects/${project.id}/edit`)}
            className="btn-secondary py-2 text-sm flex items-center gap-1.5"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Project</span>
          </button>
          <button
            onClick={() => setShowProjDeleteModal(true)}
            className="btn-danger py-2 text-sm flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Project</span>
          </button>
        </div>
      </div>

      {/* 2. Project scope details box */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {project.name}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                project.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : project.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {project.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Start: {project.startDate ? project.startDate.split('T')[0] : 'TBD'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>End: {project.endDate ? project.endDate.split('T')[0] : 'TBD'}</span>
            </span>
          </div>
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Scope Description
          </h3>
          <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed whitespace-pre-line">
            {project.description || 'No description was entered for this project.'}
          </p>
        </div>

        {/* Completion Progress percentage bar */}
        <div className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">
              Overall Task Completion Rate
            </span>
            <span className="text-brand-600 dark:text-brand-400 font-extrabold">
              {project.progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-brand-500`}
              style={{ width: `${project.progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-400">
            {project.completedTasks} of {project.totalTasks} milestones completed
          </span>
        </div>
      </div>

      {/* 3. Tasks list section */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Project Milestone Tasks</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage details and priority indicators</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              disabled={!project.tasks || project.tasks.length === 0}
              className="btn-secondary py-2 text-sm flex items-center gap-1.5 disabled:opacity-40"
            >
              <FileDown className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => navigate(`/tasks/create?projectId=${project.id}`)}
              className="btn-primary py-2 text-sm flex items-center gap-1.5"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Client-Side filters toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-6">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search tasks in project..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="input-field py-2 text-sm pl-9"
            />
          </div>

          {/* Status Select */}
          <div className="relative sm:col-span-3">
            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="input-field py-2 text-sm appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Select */}
          <div className="relative sm:col-span-3">
            <select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="input-field py-2 text-sm appearance-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Task list board */}
        {filteredTasks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  task.status === 'COMPLETED' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Mark complete circle checkbox */}
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
                      className={`font-bold text-sm ${
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
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Due: {task.dueDate ? task.dueDate.split('T')[0] : 'No due date'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority and CRUD commands */}
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="flex items-center gap-2">
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
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Edit Task"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => triggerDeleteTask(task)}
                      className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks matching filters"
            description="Create a new task milestone or loosen your filters list."
            actionText="Add Task"
            onActionClick={() => navigate(`/tasks/create?projectId=${project.id}`)}
            icon={CheckSquare}
          />
        )}
      </div>

      {/* Delete project check dialog */}
      <ConfirmationModal
        isOpen={showProjDeleteModal}
        onClose={() => setShowProjDeleteModal(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to delete the project "${project.name}"? This will permanently delete the project and all its tasks.`}
      />

      {/* Delete task check dialog */}
      <ConfirmationModal
        isOpen={showTaskDeleteModal}
        onClose={() => setShowTaskDeleteModal(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task?"
        message={`Are you sure you want to delete the milestone task "${taskToDelete?.name}"? This action cannot be undone.`}
      />

    </div>
  );
};

export default ProjectDetailsPage;
