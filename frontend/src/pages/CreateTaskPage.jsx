import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { createTask, getTaskById, updateTask } from '../services/taskService.js';
import { getAllProjects } from '../services/projectService.js';
import { useToast } from '../context/ToastContext.jsx';
import { ChevronLeft, Save, Loader2, Calendar } from 'lucide-react';

export const CreateTaskPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get('projectId');

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [projects, setProjects] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      projectId: '',
    }
  });

  // Fetch all user's projects to populate the selection dropdown
  useEffect(() => {
    const fetchProjectsList = async () => {
      try {
        const response = await getAllProjects({ limit: 100 });
        setProjects(response.data || []);
        
        // If queryProjectId was passed in creation mode, set it as default
        if (!isEditMode && queryProjectId) {
          setValue('projectId', queryProjectId);
        }
      } catch (err) {
        showToast('Failed to load project listings for task assignment.', 'error');
      }
    };
    fetchProjectsList();
  }, [queryProjectId, isEditMode, setValue, showToast]);

  // Load task details in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTaskDetails = async () => {
        try {
          const task = await getTaskById(id);
          reset({
            name: task.name,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            projectId: task.projectId.toString(), // Select fields usually compare string values
          });
        } catch (err) {
          showToast(err.message || 'Failed to retrieve task details.', 'error');
          navigate('/tasks');
        } finally {
          setFetching(false);
        }
      };
      fetchTaskDetails();
    }
  }, [id, isEditMode, reset, navigate, showToast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        projectId: parseInt(data.projectId),
        dueDate: data.dueDate || null,
      };

      if (isEditMode) {
        await updateTask(id, payload);
        showToast('Task updated successfully.', 'success');
      } else {
        await createTask(payload);
        showToast('Task created successfully.', 'success');
      }

      // If we came from project details page, let's navigate back to it
      if (queryProjectId) {
        navigate(`/projects/${queryProjectId}`);
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save task. Please verify all entries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back link breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Header title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {isEditMode ? 'Modify Milestone Task' : 'Define Milestone Task'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isEditMode
            ? 'Adjust task definitions, assignee parameters, status or priorities.'
            : 'Register a new milestone task within your selected project scope.'}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 md:p-8 space-y-5">
        
        {/* Project Selector dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Assign to Project <span className="text-red-500">*</span>
          </label>
          <select
            disabled={loading || isEditMode} // Cannot reassign projects on edits to preserve integrity
            className={`input-field appearance-none cursor-pointer ${errors.projectId ? 'border-red-500' : ''}`}
            {...register('projectId', {
              required: 'Selecting a project is required'
            })}
          >
            <option value="">Select project...</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
          {isEditMode && (
            <p className="text-[10px] text-slate-400 font-medium">Assigning to a different project is locked in edit mode.</p>
          )}
          {errors.projectId && (
            <p className="text-xs text-red-500 font-semibold">{errors.projectId.message}</p>
          )}
        </div>

        {/* Task Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Task Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={loading}
            placeholder="e.g. Implement registration endpoints"
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            {...register('name', {
              required: 'Task name is required',
              maxLength: {
                value: 120,
                message: 'Task name cannot exceed 120 characters',
              },
            })}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Detailed Description
          </label>
          <textarea
            disabled={loading}
            rows={4}
            placeholder="Provide task acceptance criteria, technical details or steps..."
            className="input-field resize-y"
            {...register('description')}
          />
        </div>

        {/* Grid Row: Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Task Priority
            </label>
            <select
              disabled={loading}
              className="input-field appearance-none cursor-pointer"
              {...register('priority')}
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Status State
            </label>
            <select
              disabled={loading}
              className="input-field appearance-none cursor-pointer"
              {...register('status')}
            >
              <option value="PENDING">Pending (Not Started)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

        </div>

        {/* Due date input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due Date</span>
          </label>
          <input
            type="date"
            disabled={loading}
            className="input-field"
            {...register('dueDate')}
          />
        </div>

        {/* Action submit buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Save className="h-4.5 w-4.5" />
            )}
            <span>{isEditMode ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateTaskPage;
