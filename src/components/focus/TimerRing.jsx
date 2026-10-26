import React from 'react';

const SIZE = 260;
const STROKE = 14;

// Big circular countdown. `progress` is how much of the current block remains
// (1 = full, 0 = finished).
export default function TimerRing({ progress, label, sublabel, tone = 'teal' }) {
  const r = (SIZE - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = c * (1 - clamped);
  const color = tone === 'amber' ? '#d97706' : '#0d9488';

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke="#e2e8f0" strokeWidth={STROKE} fill="none" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tabular-nums tracking-tight text-slate-900">{label}</span>
        {sublabel && (
          <span className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">{sublabel}</span>
        )}
      </div>
    </div>
  );
}