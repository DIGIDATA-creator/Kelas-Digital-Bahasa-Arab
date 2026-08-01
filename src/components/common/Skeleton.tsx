import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};

export const GuruDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner Skeleton */}
      <div className="bg-slate-900/80 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-xl">
        <Skeleton className="h-5 w-40 bg-emerald-900/50 rounded-full" />
        <Skeleton className="h-8 w-3/4 sm:w-1/2 bg-slate-800" />
        <Skeleton className="h-4 w-full max-w-xl bg-slate-800" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-44 bg-emerald-800/60 rounded-xl" />
          <Skeleton className="h-10 w-44 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Chart Card Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-3 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-8 w-40 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="h-[280px] w-full flex items-end justify-between gap-3 pt-6 px-4">
          {[40, 70, 55, 90, 65, 80, 45, 75].map((h, idx) => (
            <div key={idx} className="w-full flex flex-col items-center gap-2">
              <Skeleton className={`w-full rounded-t-lg bg-emerald-200 dark:bg-emerald-900/40`} style={{ height: `${h}%` }} />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <Skeleton className="h-5 w-56" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SiswaDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Student Greeting Banner Skeleton */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-xl">
        <Skeleton className="h-5 w-36 bg-emerald-900/50 rounded-full" />
        <Skeleton className="h-8 w-64 bg-slate-800" />
        <Skeleton className="h-4 w-full max-w-lg bg-slate-800" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-8 w-28 bg-emerald-800/60 rounded-xl" />
          <Skeleton className="h-8 w-32 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Stats Overview Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Material Highlight Card Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>

        {/* Quizzes List Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
