import React from 'react';
import { AlertTriangle } from 'lucide-react';

const NOTICE = 'Student prototype. Not medical advice.';

export default function PrototypeNotice({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>{NOTICE}</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="font-medium">{NOTICE}</p>
    </div>
  );
}