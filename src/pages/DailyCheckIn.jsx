import React, { useState } from 'react';
import { Save, Star } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import PrototypeNotice from '@/components/PrototypeNotice';
import { Button } from '@/components/ui/button';
import { useDemoData } from '@/lib/useDemoData';
import { todayStr } from '@/lib/analytics';
import { db } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

const FIELD =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100';

function Slider({ label, value, onChange, hintLow, hintHigh }) {
  return (
    <div>
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="shrink-0 text-sm font-semibold text-teal-600">{value ?? '–'}/10</span>
      </div>
      <input
        type="range" min={1} max={10} value={value ?? 5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>{hintLow}</span><span>{hintHigh}</span>
      </div>
    </div>
  );
}

const FIELDS = [
  { key: 'sleep_quality', label: 'How did you sleep?', low: 'Rough', high: 'Great' },
  { key: 'mood', label: "How's your mood?", low: 'Low', high: 'Good' },
  { key: 'energy', label: 'How much energy do you have?', low: 'Empty', high: 'Full' },
  { key: 'stress_anxiety', label: 'How overwhelmed do you feel?', low: 'Calm', high: 'Overwhelmed' },
  { key: 'sensory_tolerance', label: 'How are you handling noise, light, and crowds today?', low: 'Overloaded', high: 'Comfortable' },
  { key: 'engagement', label: 'How ready are you to focus?', low: 'Not yet', high: 'Ready' },
];

export default function DailyCheckIn() {
  const { loading, participant, observations, reload } = useDemoData();
  const { toast } = useToast();
  const today = todayStr();
  const [form, setForm] = useState({
    date: today,
    sleep_quality: 6, mood: 6, energy: 6, stress_anxiety: 4, sensory_tolerance: 6, engagement: 6,
    dysregulation_events: 0, recovery_time_minutes: 10, notes: '',
  });
  const [saving, setSaving] = useState(false);

  if (loading || !participant) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" /></div>;
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await db.DailyObservation.create({ ...form, participant_id: participant.id });
      toast({ title: 'Check-in saved', description: `Recorded for ${form.date}.` });
      setForm((f) => ({ ...f, notes: '' }));
      await reload();
    } catch (err) {
      toast({ title: 'Could not save check-in', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const recent = [...observations].reverse().slice(0, 6);

  return (
    <div>
      <PageHeader title="Daily Check-In" subtitle="Know your brain. Plan your day. Six quick slides — under 30 seconds." />
      <div className="mb-6"><PrototypeNotice /></div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="How are you today?" subtitle="Slide each one. 1 = low, 10 = high.">
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <Slider
                    key={f.key}
                    label={f.label}
                    value={form[f.key]}
                    hintLow={f.low}
                    hintHigh={f.high}
                    onChange={(v) => set(f.key, v)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Times I needed a break or shut down today</label>
                  <input
                    type="number" min={0} value={form.dysregulation_events}
                    onChange={(e) => set('dysregulation_events', Number(e.target.value))}
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">How long it took to feel okay again (minutes)</label>
                  <input
                    type="number" min={0} value={form.recovery_time_minutes}
                    onChange={(e) => set('recovery_time_minutes', Number(e.target.value))}
                    className={FIELD}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Anything else about today? (optional)</label>
                <textarea
                  rows={2} value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="What helped, what got in the way…"
                  className={FIELD}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save check-in'}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Recent check-ins" subtitle="Your last few days">
            <div className="space-y-3">
              {recent.length === 0 && <p className="text-sm text-slate-400">No check-ins yet.</p>}
              {recent.map((o) => (
                <div key={o.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{o.date}</span>
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="h-3.5 w-3.5" /> Focus {o.engagement}/10
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
                    <div><p className="font-semibold text-slate-700">{o.sleep_quality}</p><p>Sleep</p></div>
                    <div><p className="font-semibold text-slate-700">{o.mood}</p><p>Mood</p></div>
                    <div><p className="font-semibold text-slate-700">{o.energy}</p><p>Energy</p></div>
                  </div>
                  {o.notes && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{o.notes}</p>}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}