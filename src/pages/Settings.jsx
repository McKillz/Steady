import React, { useState } from 'react';
import { Shield, Bell, Pencil, Lock, RotateCcw, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import PrototypeNotice from '@/components/PrototypeNotice';
import { Button } from '@/components/ui/button';
import { useParticipantData } from '@/lib/ParticipantContext';
import { db, clearAllData } from '@/lib/db';
import ParticipantFormDialog from '@/components/ParticipantFormDialog';

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-800">{value ?? '—'}</span>
    </div>
  );
}

export default function Settings() {
  const { loading, participant, observations, focusSessions, reload } = useParticipantData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const startFresh = async () => {
    if (!window.confirm('Clear the demo data and start tracking yourself? This cannot be undone.')) return;
    clearAllData();
    await db.Participant.create({ name: 'Me', is_demo: false });
    window.location.reload();
  };

  const resetDemo = () => {
    if (!window.confirm('Replace everything on this device with the demo student?')) return;
    clearAllData();
    window.location.reload();
  };

  if (loading || !participant) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" /></div>;
  }

  const fmtDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—');

  const calcAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return age >= 0 ? age : null;
  };
  const age = calcAge(participant.date_of_birth);
  const observationsCount = observations.length;
  const focusCount = focusSessions.length;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your profile and data." />
      <div className="mb-6"><PrototypeNotice /></div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="My Profile"
          subtitle={participant.is_demo ? 'Demo profile' : 'Your Steady profile'}
          action={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          }
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-amber-500 text-lg font-semibold text-white">
              {participant.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{participant.name}</p>
              <p className="text-sm text-slate-500">{participant.is_demo ? 'Demo profile' : 'Your profile'}</p>
            </div>
          </div>

          <div className="mt-4">
            <Row label="Name" value={participant.name} />
            <Row label="Date of birth" value={fmtDate(participant.date_of_birth)} />
            <Row label="Age" value={age} />
            <Row label="Sensory considerations" value={participant.sensory_considerations} />
            <Row label="Current goals" value={participant.current_goals} />
            <Row label="Notes" value={participant.notes} />
            <Row label="Check-ins logged" value={observationsCount} />
            <Row label="Focus sessions logged" value={focusCount} />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Your profile and data are saved only on this device.
          </div>
        </SectionCard>

        <SectionCard title="Your data" subtitle="Stored on this device">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            <Shield className="h-4 w-4 shrink-0" />
            No account and no server. Everything you log stays in this browser.
          </div>
          <Row label="Records stored" value={observations.length + focusSessions.length + 1} />
          <p className="mt-3 text-xs text-slate-500">
            Steady opens with a demo student so you can see how it works. Start fresh to clear it and track yourself.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={startFresh} className="gap-2">
              <Sparkles className="h-4 w-4" /> Start fresh
            </Button>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reload demo data
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" subtitle="Timer alerts">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
            <Bell className="h-4 w-4" />
            The Focus Timer can send a browser notification when a block or break ends. Your browser asks for permission the first time you start a block.
          </div>
        </SectionCard>
      </div>

      <ParticipantFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        participant={participant}
        onSaved={() => reload()}
      />
    </div>
  );
}