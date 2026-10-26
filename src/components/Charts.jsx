import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, BarChart, Bar, Legend,
} from 'recharts';

const axisStyle = { fontSize: 11, fill: '#94a3b8' };

function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00Z');
  return `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`;
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-500">
          {p.name}: <span className="font-semibold text-slate-800">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendArea({ data, dataKey, name, color = '#0d9488', unit = '', height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={[0, 'auto']} />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} fill={`url(#grad-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({ data, lines, height = 240, legend = false, domain = [0, 100] }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: legend ? 4 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={domain} />
        <Tooltip content={<CustomTooltip />} />
        {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />}
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} dot={false} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MiniBar({ data, dataKey, name, color = '#0d9488', height = 220, unit = '', domain }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={domain} />
        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function toSeries(rows, dateKey, valueKey, unit) {
  return (rows || []).map((r) => ({ label: fmtDate(r[dateKey]), [valueKey]: r[valueKey] }));
}