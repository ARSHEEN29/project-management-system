import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createProject, getProjectById, updateProject } from '../services/projectService.js';
import { useToast } from '../context/ToastContext.jsx';
import { ChevronLeft, Save, Loader2, Calendar } from 'lucide-react';

export const CreateProjectPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'NOT_STARTED',
      startDate: '',
      endDate: '',
    }
  });

  const watchStartDate = watch('startDate');

  // Load project details if in Edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProject = async () => {
        try {
          const project = await getProjectById(id);
          // Format date strings YYYY-MM-DD for standard html date input fields
          const formattedProj = {
            ...project,
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : '',
          };
          reset(formattedProj);
        } catch (err) {
          showToast(err.message || 'Failed to retrieve project details.', 'error');
          navigate('/projects');
        } finally {
          setFetching(false);
        }
      };
      fetchProject();
    }
  }, [id, isEditMode, reset, navigate, showToast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Clean up empty date strings
      const payload = {
        ...data,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      if (isEditMode) {
        await updateProject(id, payload);
        showToast('Project updated successfully.', 'success');
      } else {
        await createProject(payload);
        showToast('Project created successfully.', 'success');
      }
      navigate('/projects');
    } catch (err) {
      showToast(err.message || 'Failed to save project. Please check fields.', 'error');
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
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2">
        <Link
          to="/projects"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Header title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {isEditMode ? 'Modify Project' : 'Launch New Project'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isEditMode
            ? 'Adjust details, status, dates or properties.'
            : 'Fill out the core scope details below to get started.'}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 md:p-8 space-y-5">
        
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={loading}
            placeholder="e.g. Website Redesign v2"
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            {...register('name', {
              required: 'Project Name is required',
              maxLength: {
                value: 100,
                message: 'Name cannot exceed 100 characters',
              },
            })}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Description
          </label>
          <textarea
            disabled={loading}
            rows={4}
            placeholder="Outline the goals, milestones, or boundaries of this project..."
            className="input-field resize-y"
            {...register('description')}
          />
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Status
          </label>
          <select
            disabled={loading}
            className="input-field appearance-none cursor-pointer"
            {...register('status')}
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Date Row inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Start Date</span>
            </label>
            <input
              type="date"
              disabled={loading}
              className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
              {...register('startDate')}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>End Date</span>
            </label>
            <input
              type="date"
              disabled={loading}
              className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
              {...register('endDate', {
                validate: (value) => {
                  if (value && watchStartDate) {
                    const start = new Date(watchStartDate);
                    const end = new Date(value);
                    if (end < start) {
                      return 'End date must be on or after the start date.';
                    }
                  }
                  return true;
                },
              })}
            />
            {errors.endDate && (
              <p className="text-xs text-red-500 font-semibold">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* Submit Actions button */}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800/50">
          <Link
            to="/projects"
            className="btn-secondary flex items-center"
          >
            Cancel
          </Link>
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
            <span>{isEditMode ? 'Update Project' : 'Create Project'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateProjectPage;
