import React from 'react';
import { Lightbulb } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import PrototypeNotice from '@/components/PrototypeNotice';
import { MultiLine, MiniBar } from '@/components/Charts';
import { useDemoData } from '@/lib/useDemoData';
import {
  dailyFocusSeries, ratingByEnvironment, ratingByBlockLength, buildInsights,
} from '@/lib/analytics';

export default function Progress() {
  const { loading, seeding, observations, focusSessions } = useDemoData();

  if (loading || seeding) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" /></div>;
  }

  const series = dailyFocusSeries(observations, focusSessions, 14);
  const byEnvironment = ratingByEnvironment(focusSessions);
  const byBlock = ratingByBlockLength(focusSessions);
  const insights = buildInsights(observations, focusSessions);

  return (
    <div>
      <PageHeader
        title="Progress"
        subtitle="Know your brain. Plan your day. What your check-ins and focus sessions add up to."
      />
      <div className="mb-6"><PrototypeNotice /></div>

      <SectionCard
        title="Sensory tolerance & focus, last 14 days"
        subtitle="Your daily check-in rating next to your average focus rating that day"
      >
        <MultiLine
          domain={[0, 10]}
          legend
          data={series}
          lines={[
            { key: 'sensory', name: 'Sensory tolerance', color: '#0d9488' },
            { key: 'focus', name: 'Focus rating', color: '#d97706' },
          ]}
        />
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Focus by environment" subtitle="Average focus rating in each place you work">
          <MiniBar data={byEnvironment} dataKey="rating" name="Focus rating" color="#0d9488" unit="/10" domain={[0, 10]} />
        </SectionCard>
        <SectionCard title="Focus by block length" subtitle="Average focus rating for each block you pick">
          <MiniBar data={byBlock} dataKey="rating" name="Focus rating" color="#d97706" unit="/10" domain={[0, 10]} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Patterns" subtitle="From your own check-ins and focus sessions.">
          <div className="space-y-3">
            {insights.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-50/60 p-3 ring-1 ring-amber-100">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-sm text-slate-700">{t}</p>
              </div>
            ))}
            <p className="text-xs text-slate-400">
              These patterns describe your own data. They are not medical advice and do not prove cause.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}