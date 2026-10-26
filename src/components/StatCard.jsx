import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, unit, icon: Icon, accent = 'teal', sub, children }) {
  const accents = {
    teal: 'from-teal-500/10 to-teal-500/0 text-teal-600',
    sand: 'from-amber-500/10 to-amber-500/0 text-amber-600',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-600',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-600',
    sky: 'from-sky-500/10 to-sky-500/0 text-sky-600',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-xl bg-gradient-to-br p-2.5', accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}