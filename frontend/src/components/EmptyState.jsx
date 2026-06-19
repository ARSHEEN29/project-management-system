import React from 'react';
import { Plus } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'Get started by creating a new entry.',
  actionText,
  onActionClick,
  icon: Icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card max-w-lg mx-auto py-12">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-500 dark:text-brand-400 mb-4 shrink-0">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
