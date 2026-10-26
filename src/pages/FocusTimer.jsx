import React, { useState, useEffect } from 'react';
import { Play, Pause, Coffee, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import PrototypeNotice from '@/components/PrototypeNotice';
import TimerRing from '@/components/focus/TimerRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db';
import { useParticipantData } from '@/lib/ParticipantContext';
import { todayStr } from '@/lib/analytics';
import { useToast } from '@/components/ui/use-toast';
import {
  playChime,
  showTimerNotification,
  requestNotificationPermission,
  unlockAudio,
  focusDoneMessage,
  breakDoneMessage,
} from '@/lib/focusAlerts';

const FIELD =
  'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100';

const ENVIRONMENTS = [
  { value: 'quiet_room', label: 'Quiet room' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'library', label: 'Library' },
  { value: 'home', label: 'Home' },
  { value: 'other', label: 'Other' },
];

const BLOCKS = [5, 10, 20, 30];
const BREAK_SECONDS = 120;
const BREAK_TIPS = [
  'Look away from the screen. Breathe slowly.',
  'Get a glass of water.',
  'Stand up and stretch your arms over your head.',
  'Look at something far away for 20 seconds.',
  'Close your eyes and count five slow breaths.',
];
const APP_TITLE = 'Steady';
const STORAGE_KEY = 'steady.focusTimer.v1';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Remaining seconds from a real end timestamp, so the countdown keeps ticking
// correctly while the tab is in the background.
const secondsUntil = (endsAt) => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function FocusTimer() {
  const { toast } = useToast();
  const { focusSessions, reload } = useParticipantData();
  // A timer left running when the student switches pages or refreshes the app.
  const [saved] = useState(loadSaved);

  const [tip, setTip] = useState(BREAK_TIPS[0]);
  const [phase, setPhase] = useState(saved?.phase === 'focus' || saved?.phase === 'break' ? saved.phase : 'setup');
  const [taskLabel, setTaskLabel] = useState(saved?.taskLabel ?? '');
  const [environment, setEnvironment] = useState(saved?.environment ?? 'quiet_room');
  const [plannedMinutes, setPlannedMinutes] = useState(saved?.plannedMinutes ?? 20);
  const [secondsLeft, setSecondsLeft] = useState(saved?.secondsLeft ?? 0);
  const [running, setRunning] = useState(saved?.running ?? false);
  const [focusEndsAt, setFocusEndsAt] = useState(saved?.focusEndsAt ?? null);
  const [runStartedAt, setRunStartedAt] = useState(saved?.runStartedAt ?? null);
  const [elapsedBase, setElapsedBase] = useState(saved?.elapsedBase ?? 0);
  const [breakLeft, setBreakLeft] = useState(saved?.breakLeft ?? BREAK_SECONDS);
  const [breakRunning, setBreakRunning] = useState(saved?.breakRunning ?? false);
  const [breakEndsAt, setBreakEndsAt] = useState(saved?.breakEndsAt ?? null);
  const [breaksTaken, setBreaksTaken] = useState(saved?.breaksTaken ?? 0);
  const [elapsed, setElapsed] = useState(saved?.elapsedBase ?? 0);
  const [startedAt, setStartedAt] = useState(saved?.startedAt ? new Date(saved.startedAt) : null);
  const [rating, setRating] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Newest first — the shared list is sorted oldest to newest.
  const recent = [...focusSessions].reverse().slice(0, 5);

  // Start (or resume) a focus segment from a known number of seconds left.
  const beginFocusSegment = (remainingSeconds) => {
    const now = Date.now();
    setSecondsLeft(remainingSeconds);
    setFocusEndsAt(now + remainingSeconds * 1000);
    setRunStartedAt(now);
    setRunning(true);
  };

  const start = () => {
    if (!taskLabel.trim()) {
      toast({ title: 'Add what you are working on first', variant: 'destructive' });
      return;
    }
    // Both need a user gesture the first time.
    unlockAudio();
    requestNotificationPermission();
    setElapsed(0);
    setElapsedBase(0);
    setBreaksTaken(0);
    setRating(7);
    setNotes('');
    setStartedAt(new Date());
    setPhase('focus');
    beginFocusSegment(plannedMinutes * 60);
  };

  const pauseFocus = () => {
    if (running && runStartedAt && focusEndsAt) {
      const stoppedAt = Math.min(Date.now(), focusEndsAt);
      setElapsedBase(elapsedBase + Math.max(0, Math.floor((stoppedAt - runStartedAt) / 1000)));
    }
    setRunning(false);
  };

  const resumeFocus = () => {
    setBreakRunning(false);
    setBreakLeft(BREAK_SECONDS);
    setBreakEndsAt(null);
    setPhase('focus');
    beginFocusSegment(secondsLeft);
  };

  const takeBreak = () => {
    pauseFocus();
    setTip(BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)]);
    setBreaksTaken((b) => b + 1);
    setBreakLeft(BREAK_SECONDS);
    setBreakEndsAt(Date.now() + BREAK_SECONDS * 1000);
    setBreakRunning(true);
    setPhase('break');
  };

  const completeFocus = () => {
    setRunning(false);
    setPhase('rate');
    playChime();
    showTimerNotification(focusDoneMessage);
  };

  const completeBreak = () => {
    setBreakRunning(false);
    setBreakLeft(BREAK_SECONDS);
    setBreakEndsAt(null);
    playChime();
    showTimerNotification(breakDoneMessage);
    setPhase('focus');
    beginFocusSegment(secondsLeft);
  };

  const finish = () => {
    pauseFocus();
    setPhase('rate');
  };

  const discard = () => {
    setRunning(false);
    setBreakRunning(false);
    setSecondsLeft(0);
    setFocusEndsAt(null);
    setRunStartedAt(null);
    setElapsed(0);
    setElapsedBase(0);
    setBreakLeft(BREAK_SECONDS);
    setBreakEndsAt(null);
    setBreaksTaken(0);
    setStartedAt(null);
    setPhase('setup');
  };

  const save = async () => {
    setSaving(true);
    try {
      const startTime = startedAt
        ? `${String(startedAt.getHours()).padStart(2, '0')}:${String(startedAt.getMinutes()).padStart(2, '0')}`
        : '';
      await db.FocusSession.create({
        date: todayStr(),
        start_time: startTime,
        planned_minutes: plannedMinutes,
        actual_minutes: Math.max(1, Math.round(elapsed / 60)),
        breaks_taken: breaksTaken,
        focus_rating: rating,
        task_label: taskLabel.trim(),
        environment,
        notes: notes.trim(),
      });
      toast({ title: 'Focus session saved' });
      setPhase('setup');
      setSecondsLeft(0);
      setFocusEndsAt(null);
      setRunStartedAt(null);
      setElapsed(0);
      setElapsedBase(0);
      setBreaksTaken(0);
      setStartedAt(null);
      await reload();
    } catch (err) {
      toast({ title: 'Could not save session', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Focus countdown — recomputed from the end timestamp every tick, so it stays
  // accurate when the browser throttles timers in a background tab.
  useEffect(() => {
    if (phase !== 'focus' || !running || !focusEndsAt || !runStartedAt) return;
    let done = false;
    const sync = () => {
      const remaining = secondsUntil(focusEndsAt);
      const stoppedAt = Math.min(Date.now(), focusEndsAt);
      setSecondsLeft(remaining);
      setElapsed(elapsedBase + Math.max(0, Math.floor((stoppedAt - runStartedAt) / 1000)));
      if (remaining <= 0 && !done) {
        done = true;
        completeFocus();
      }
    };
    sync();
    const interval = setInterval(sync, 500);
    const timeout = setTimeout(sync, Math.max(0, focusEndsAt - Date.now()) + 100);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [phase, running, focusEndsAt, runStartedAt, elapsedBase]);

  // Break countdown — same timestamp-based approach.
  useEffect(() => {
    if (phase !== 'break' || !breakRunning || !breakEndsAt) return;
    let done = false;
    const sync = () => {
      const remaining = secondsUntil(breakEndsAt);
      setBreakLeft(remaining);
      if (remaining <= 0 && !done) {
        done = true;
        completeBreak();
      }
    };
    sync();
    const interval = setInterval(sync, 500);
    const timeout = setTimeout(sync, Math.max(0, breakEndsAt - Date.now()) + 100);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [phase, breakRunning, breakEndsAt, secondsLeft]);

  // Keep the running timer in localStorage so it survives page changes and refreshes.
  useEffect(() => {
    if (phase !== 'focus' && phase !== 'break') {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload = {
      phase,
      taskLabel,
      environment,
      plannedMinutes,
      secondsLeft,
      running,
      focusEndsAt,
      runStartedAt,
      elapsedBase,
      breakLeft,
      breakRunning,
      breakEndsAt,
      breaksTaken,
      startedAt: startedAt ? startedAt.toISOString() : null,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage is optional */
    }
  }, [
    phase,
    taskLabel,
    environment,
    plannedMinutes,
    secondsLeft,
    running,
    focusEndsAt,
    runStartedAt,
    elapsedBase,
    breakLeft,
    breakRunning,
    breakEndsAt,
    breaksTaken,
    startedAt,
  ]);

  // Show the countdown in the browser tab title while a timer runs.
  useEffect(() => {
    if (phase === 'focus' && running) document.title = `${fmt(secondsLeft)} · ${APP_TITLE}`;
    else if (phase === 'break' && breakRunning) document.title = `${fmt(breakLeft)} · ${APP_TITLE}`;
    else document.title = APP_TITLE;
    return () => {
      document.title = APP_TITLE;
    };
  }, [phase, running, secondsLeft, breakRunning, breakLeft]);

  const total = plannedMinutes * 60;
  const progress = phase === 'break' ? breakLeft / BREAK_SECONDS : (total ? secondsLeft / total : 0);

  return (
    <div>
      <PageHeader
        title="Focus Timer"
        subtitle="Know your brain. Plan your day. Pick a block, focus, and take a break when you need one."
      />
      <div className="mb-6"><PrototypeNotice /></div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {phase === 'setup' && (
            <SectionCard title="Start a focus block" subtitle="Three quick choices.">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="f-task">What are you working on?</Label>
                  <Input
                    id="f-task"
                    value={taskLabel}
                    onChange={(e) => setTaskLabel(e.target.value)}
                    placeholder="e.g. History essay outline"
                    className={FIELD}
                  />
                </div>

                <div>
                  <Label htmlFor="f-env">Where are you?</Label>
                  <select
                    id="f-env"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className={FIELD}
                  >
                    {ENVIRONMENTS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>How long?</Label>
                  <div className="mt-1.5 grid grid-cols-4 gap-2">
                    {BLOCKS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPlannedMinutes(m)}
                        className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
                          plannedMinutes === m
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={start} className="gap-2">
                    <Play className="h-4 w-4" /> Start focus
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}

          {(phase === 'focus' || phase === 'break') && (
            <SectionCard
              title={phase === 'break' ? 'Break time' : 'Focusing'}
              subtitle={taskLabel || 'Focus block'}
              action={
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  {ENVIRONMENTS.find((e) => e.value === environment)?.label}
                </span>
              }
            >
              <TimerRing
                progress={progress}
                label={phase === 'break' ? fmt(breakLeft) : fmt(secondsLeft)}
                sublabel={phase === 'break' ? 'Break' : `of ${plannedMinutes} min`}
                tone={phase === 'break' ? 'amber' : 'teal'}
              />

              {phase === 'break' && (
                <p className="mx-auto mt-5 max-w-xs text-center text-sm text-slate-600">
                  {tip}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {phase === 'focus' && (running ? (
                  <Button variant="outline" onClick={pauseFocus} className="gap-2">
                    <Pause className="h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button onClick={resumeFocus} className="gap-2">
                    <Play className="h-4 w-4" /> Resume
                  </Button>
                ))}
                {phase === 'focus' && (
                  <Button variant="outline" onClick={takeBreak} className="gap-2">
                    <Coffee className="h-4 w-4" /> I need a break
                  </Button>
                )}
                {phase === 'break' && (
                  <Button onClick={resumeFocus} className="gap-2">
                    <Play className="h-4 w-4" /> Back to focus
                  </Button>
                )}
                {phase === 'focus' && (
                  <Button variant="outline" onClick={finish} className="gap-2">
                    <Check className="h-4 w-4" /> Done
                  </Button>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                Breaks taken: {breaksTaken}
              </p>
            </SectionCard>
          )}

          {phase === 'rate' && (
            <SectionCard title="How focused were you?" subtitle="Then save this block.">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Focus rating</label>
                <span className="text-sm font-semibold text-teal-600">{rating}/10</span>
              </div>
              <input
                type="range" min={1} max={10} value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>Scattered</span><span>Locked in</span>
              </div>

              <div className="mt-5">
                <Label htmlFor="f-notes">Notes (optional)</Label>
                <Textarea
                  id="f-notes" rows={2} value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What helped or got in the way?"
                  className={FIELD}
                />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {Math.max(1, Math.round(elapsed / 60))} min focused · {breaksTaken} break{breaksTaken === 1 ? '' : 's'}
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={discard} disabled={saving}>Discard</Button>
                <Button onClick={save} disabled={saving} className="gap-2">
                  {saving ? 'Saving…' : 'Save session'}
                </Button>
              </div>
            </SectionCard>
          )}
        </div>

        <div>
          <SectionCard title="Last 5 sessions" subtitle="Your recent focus blocks">
            {recent.length === 0 && <p className="text-sm text-slate-400">No sessions yet.</p>}
            <div className="space-y-3">
              {recent.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-800">{s.task_label || 'Focus block'}</p>
                    <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
                      {s.focus_rating}/10
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {s.date} · {s.actual_minutes} min of {s.planned_minutes} · {s.breaks_taken} break{s.breaks_taken === 1 ? '' : 's'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {ENVIRONMENTS.find((e) => e.value === s.environment)?.label || s.environment}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
