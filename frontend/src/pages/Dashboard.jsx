import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService.js';
import { useToast } from '../context/ToastContext.jsx';
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton.jsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Activity,
  ListTodo,
  TrendingUp,
  AlertCircle,
  FileText,
  PlusCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        showToast(err.message || 'Failed to fetch dashboard metrics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* KPI Skeleton grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        {/* Charts Skeleton grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { summary, charts, recentTasks, recentLogs } = stats || {};

  // KPI card configuration data
  const cards = [
    {
      title: 'Total Projects',
      value: summary?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400',
      description: 'Active database projects'
    },
    {
      title: 'Projects in Progress',
      value: summary?.projectsInProgress || 0,
      icon: Activity,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
      description: 'Currently actively tracked'
    },
    {
      title: 'Total Tasks',
      value: summary?.totalTasks || 0,
      icon: ListTodo,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
      description: 'Tasks across all projects'
    },
    {
      title: 'Tasks Completed',
      value: summary?.tasksCompleted || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      description: `${
        summary?.totalTasks
          ? Math.round((summary.tasksCompleted / summary.totalTasks) * 100)
          : 0
      }% overall completion rate`
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time project statuses and task velocity metrics.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => navigate('/projects/create')}
            className="btn-primary"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>New Project</span>
          </button>
          <button
            onClick={() => navigate('/tasks/create')}
            className="btn-secondary"
          >
            <ListTodo className="h-4.5 w-4.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. Key statistics metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="glass-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight font-sans">
                {card.value}
              </span>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Recharts graphs visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project status pie */}
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-base font-bold mb-4">Project Statuses</h3>
          <div className="flex-1 min-h-0 relative">
            {summary?.totalProjects === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                No project records found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.projectStatusDistribution || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts?.projectStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task priority bar chart */}
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-base font-bold mb-4">Task Priority Volumes</h3>
          <div className="flex-1 min-h-0 relative">
            {summary?.totalTasks === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                No task records found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.taskPriorityData || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {charts?.taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Completion chart */}
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-base font-bold mb-4">Task Completion</h3>
          <div className="flex-1 min-h-0 relative">
            {summary?.totalTasks === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                No tasks available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.taskStatusData || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={75}
                    labelLine={false}
                    dataKey="value"
                  >
                    {charts?.taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 4. Widgets panel: Recent tasks and activity history timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent tasks widget */}
        <div className="glass-card p-6 lg:col-span-7 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold">Recent Tasks</h3>
              <p className="text-xs text-slate-400">Latest additions to your project boards</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate hover:text-brand-500 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${task.projectId}`)}>
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                        {task.project.name}
                      </span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate ? task.dueDate.split('T')[0] : 'No due date'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    {/* Priority label */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'HIGH'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <ListTodo className="h-8 w-8 text-slate-500 mb-2 opacity-50" />
                <span>No tasks created yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity timeline widget */}
        <div className="glass-card p-6 lg:col-span-5 flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-bold">Activity Timeline</h3>
            <p className="text-xs text-slate-400">Recent workspace audit log history</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[260px] pr-1 space-y-4">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log, index) => (
                <div key={log.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {/* Timeline connector thread */}
                  {index < recentLogs.length - 1 && (
                    <span
                      className="absolute top-5 left-[15px] bottom-[-20px] w-0.5 bg-slate-200 dark:bg-slate-800"
                      aria-hidden="true"
                    ></span>
                  )}
                  
                  {/* Action Icon bullet */}
                  <div
                    className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                      log.action === 'CREATE'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : log.action === 'DELETE'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                        : log.action === 'COMPLETE'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-650 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <FileText className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {log.details}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <Clock className="h-8 w-8 text-slate-500 mb-2 opacity-50" />
                <span>No activities recorded yet</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
