import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, deleteProject } from '../services/projectService.js';
import { useToast } from '../context/ToastContext.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import {
  Search,
  Filter,
  PlusCircle,
  FolderKanban,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, filter, sorting, pagination state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  // Delete project state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllProjects({
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 6
      });
      setProjects(response.data || []);
      setPagination(response.pagination || { totalPages: 1, totalItems: 0 });
    } catch (err) {
      showToast(err.message || 'Failed to load projects list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder, page, showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when filters change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value.split(':');
    setSortBy(val[0]);
    setSortOrder(val[1]);
    setPage(1);
  };

  // Delete Project handler
  const triggerDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (!deleteId) return;
    try {
      await deleteProject(deleteId);
      showToast(`Project "${deleteName}" was deleted successfully.`, 'success');
      fetchProjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create, manage, and monitor your custom projects.
          </p>
        </div>
        <button
          onClick={() => navigate('/projects/create')}
          className="btn-primary shrink-0 inline-flex items-center gap-2"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search */}
        <div className="relative md:col-span-6">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search projects by name..."
            value={search}
            onChange={handleSearchChange}
            className="input-field pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="relative md:col-span-3">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="h-4 w-4" />
          </span>
        </div>

        {/* Sorting */}
        <div className="relative md:col-span-3">
          <select
            onChange={handleSortChange}
            value={`${sortBy}:${sortOrder}`}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="createdAt:desc">Newest Created</option>
            <option value="createdAt:asc">Oldest Created</option>
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="startDate:asc">Start Date (Earliest)</option>
            <option value="endDate:asc">End Date (Earliest)</option>
          </select>
        </div>

      </div>

      {/* Main Grid display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="glass-card p-6 flex flex-col justify-between group relative overflow-hidden">
                <div>
                  {/* Title & Actions */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg truncate flex-1 group-hover:text-brand-500 transition-colors" onClick={() => navigate(`/projects/${project.id}`)}>
                      {project.name}
                    </h3>
                    
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
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

                  {/* Date information */}
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {project.startDate ? project.startDate.split('T')[0] : 'TBD'} — {project.endDate ? project.endDate.split('T')[0] : 'TBD'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress bar info */}
                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-400">Project Progress</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {project.progressPercentage}%
                    </span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : project.progressPercentage > 60
                          ? 'bg-brand-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${project.progressPercentage}%` }}
                    ></div>
                  </div>

                  {/* Task counts indicator */}
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1.5">
                    <span>{project.completedTasks || 0} / {project.totalTasks || 0} tasks completed</span>
                  </div>
                </div>

                {/* Hover options block overlay */}
                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2 justify-end">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="p-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => triggerDelete(project.id, project.name)}
                    className="p-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">
                Showing Page {page} of {pagination.totalPages} ({pagination.totalItems} total items)
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
          title="No projects found"
          description="You haven't created any projects matching these filter criteria yet."
          actionText="Create Project"
          onActionClick={() => navigate('/projects/create')}
          icon={FolderKanban}
        />
      )}

      {/* Warning check modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to delete the project "${deleteName}"? This will permanently delete the project record and delete all associated tasks, timeline entries, and logs.`}
        confirmText="Yes, delete it"
      />
    </div>
  );
};

export default ProjectsPage;
