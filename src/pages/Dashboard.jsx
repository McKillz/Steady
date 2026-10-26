import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, Star, Play, ClipboardCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import SectionCard from '@/components/SectionCard';
import PrototypeNotice from '@/components/PrototypeNotice';
import { Button } from '@/components/ui/button';
import { useDemoData } from '@/lib/useDemoData';
import { todayStr, focusSessionsSince, totalFocusMinutes, averageFocusRating } from '@/lib/analytics';

const SUMMARY = [
  { key: 'sleep_quality', label: 'Sleep' },
  { key: 'mood', label: 'Mood' },
  { key: 'energy', label: 'Energy' },
  { key: 'stress_anxiety', label: 'Overwhelm' },
  { key: 'sensory_tolerance', label: 'Sensory' },
  { key: 'engagement', label: 'Ready to focus' },
];

export default function Dashboard() {
  const { loading, seeding, participant, observations, focusSessions } = useDemoData();

  if (loading || seeding) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const today = todayStr();
  const todayObs = [...observations].reverse().find((o) => o.date === today);
  const weekSessions = focusSessionsSince(focusSessions, 7);
  const weekMinutes = totalFocusMinutes(weekSessions);
  const weekRating = averageFocusRating(weekSessions);

  return (
    <div>
      <PageHeader
        title={`Welcome back${participant ? `, ${participant.name.split(' ')[0]}` : ''}`}
        subtitle="Know your brain. Plan your day."
        action={
          <Button asChild className="gap-2">
            <Link to="/focus"><Play className="h-4 w-4" /> Start focus session</Link>
          </Button>
        }
      />
      <div className="mb-6"><PrototypeNotice /></div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Today's check-in"
          subtitle={todayObs ? `Logged for ${todayObs.date}` : 'Not logged yet today'}
          action={todayObs ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/check-in">Update</Link>
            </Button>
          ) : null}
        >
          {todayObs ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SUMMARY.map((s) => (
                <div key={s.key} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {todayObs[s.key] ?? '–'}
                    <span className="text-xs font-normal text-slate-400">/10</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl bg-teal-50/60 p-4">
              <p className="text-sm text-slate-600">Six quick slides — it takes under 30 seconds.</p>
              <Button asChild className="gap-2">
                <Link to="/check-in"><ClipboardCheck className="h-4 w-4" /> Check in now</Link>
              </Button>
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <StatCard
            label="Focus minutes this week"
            value={weekMinutes}
            unit="min"
            icon={Timer}
            accent="teal"
            sub={`${weekSessions.length} session${weekSessions.length === 1 ? '' : 's'} in the last 7 days`}
          />
          <StatCard
            label="Average focus rating"
            value={weekRating || '–'}
            unit={weekRating ? '/10' : ''}
            icon={Star}
            accent="sand"
            sub="Across this week's sessions"
          />
        </div>
      </div>
    </div>
  );
}