import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Timer, ClipboardCheck, TrendingUp, Settings as SettingsIcon,
  Menu, X, Lock, Info,
} from 'lucide-react';
import PrototypeNotice from '@/components/PrototypeNotice';
import BrandMark from '@/components/BrandMark';
import { ParticipantProvider } from '@/lib/ParticipantContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/focus', label: 'Focus Timer', icon: Timer },
  { to: '/check-in', label: 'Daily Check-In', icon: ClipboardCheck },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="h-10 w-10" />
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-slate-900">Steady</p>
        <p className="text-[11px] text-slate-400">Know your brain. Plan your day.</p>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function AboutLink() {
  return (
    <NavLink
      to="/about"
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
          isActive
            ? 'bg-teal-50 text-teal-700'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }`
      }
    >
      <Info className="h-4 w-4 shrink-0" />
      About
    </NavLink>
  );
}

function UserChip() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] text-slate-500">
      <Lock className="h-3.5 w-3.5 shrink-0 text-teal-600" />
      <span>No account needed. Your data stays on this device.</span>
    </div>
  );
}

function AppLayoutInner() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <div className="space-y-3">
          <AboutLink />
          <PrototypeNotice compact />
          <UserChip />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white px-4 py-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex-1"><NavLinks /></div>
            <div className="space-y-3">
              <AboutLink />
              <PrototypeNotice compact />
              <UserChip />
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <Brand />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <ParticipantProvider>
      <AppLayoutInner />
    </ParticipantProvider>
  );
}