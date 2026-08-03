import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      style={style}
      className={`shimmer-effect bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`}
    />
  );
};

export const GuruDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Skeleton */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 rounded-2xl p-6 sm:p-8 space-y-4 border border-emerald-800/40 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-44 bg-emerald-800/40 rounded-full" />
          <Skeleton className="h-6 w-24 bg-emerald-900/30 rounded-full" />
        </div>
        <Skeleton className="h-9 w-3/4 sm:w-1/2 bg-slate-800/90 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-xl bg-slate-800/70 rounded-md" />
        <div className="flex flex-wrap gap-3 pt-2">
          <Skeleton className="h-10 w-44 bg-emerald-600/30 rounded-xl" />
          <Skeleton className="h-10 w-44 bg-slate-800/80 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30" />
            </div>
            <Skeleton className="h-8 w-20 bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-3.5 w-80 bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-9 w-36 rounded-xl bg-emerald-100 dark:bg-emerald-900/40" />
          </div>
        </div>

        {/* Categories summary chips skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <Skeleton className="h-3 w-20 bg-slate-300 dark:bg-slate-700" />
              <Skeleton className="h-6 w-12 bg-emerald-600/20" />
            </div>
          ))}
        </div>

        {/* Shimmer Chart Bars */}
        <div className="h-[260px] w-full flex items-end justify-between gap-3 pt-6 px-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          {[45, 75, 60, 95, 70, 85, 50, 80].map((h, idx) => (
            <div key={idx} className="w-full flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500/40 to-teal-400/60 dark:from-emerald-900/50 dark:to-teal-700/60"
                style={{ height: `${h}%` }}
              />
              <Skeleton className="h-3 w-12 bg-slate-300 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-4 w-12 bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-8 w-28 rounded-lg bg-emerald-100 dark:bg-emerald-900/30" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3 bg-slate-300 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-800" />
                </div>
                <Skeleton className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800" />
              </div>
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
