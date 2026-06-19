import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 mb-2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-slate-100 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/6"></div>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4 flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="glass-card p-6 animate-pulse flex flex-col justify-between h-[300px]">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-4"></div>
      <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full flex items-end justify-around p-4 gap-4">
        <div className="bg-slate-300 dark:bg-slate-700 w-12 rounded-t-lg h-[40%]"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-12 rounded-t-lg h-[70%]"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-12 rounded-t-lg h-[55%]"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-12 rounded-t-lg h-[85%]"></div>
      </div>
    </div>
  );
};

export const ListSkeleton = ({ items = 3 }) => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex gap-4 p-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
