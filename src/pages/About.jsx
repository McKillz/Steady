import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';

export default function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="About" subtitle="Why Steady exists." />

      <div className="space-y-6">
        <SectionCard title="Why I built Steady" subtitle="In my own words">
          <p className="text-sm leading-relaxed text-slate-600">
            Autism and other forms of neurodivergence are being diagnosed more and more every year, but support
            hasn’t kept up. Care is expensive, and most tools are built for clinics and caregivers, not for the
            student. During my internship at a Bay Area health-tech company working on therapy for neurodivergent
            kids, I saw that gap firsthand. I built Steady so students can understand their own brains: notice when
            they’re overloaded, find the setting and block length that help them focus, and have that information
            for themselves. I also want it to build awareness that neurodivergent students don’t need fixing, they
            need tools that fit how they work.
          </p>
        </SectionCard>

        <SectionCard title="Who built it" subtitle="2026 Congressional App Challenge">
          <p className="text-sm leading-relaxed text-slate-600">
            Built by Sean Bandrapalli, Burlingame, CA, for the 2026 Congressional App Challenge.
          </p>
        </SectionCard>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-medium">Steady is a student prototype, not medical advice.</p>
        </div>
      </div>
    </div>
  );
}