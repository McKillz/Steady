// Synthetic demo data generator for the Steady prototype.
// One demo student: 14 days of check-ins and 20 focus sessions, shaped so the
// charts and patterns in the app land on something real. All values are fictional.

import { clamp, dateStr } from '@/lib/analytics';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAYS = 14;

// Index 0 = 13 days ago, index 13 = today. High sensory days are the settled ones.
const SENSORY = [8, 6, 9, 5, 7, 8, 4, 7, 9, 6, 8, 5, 7, 8];

const ENVIRONMENTS = [
  'quiet_room', 'library', 'home', 'classroom', 'quiet_room', 'library', 'quiet_room',
  'home', 'library', 'quiet_room', 'classroom', 'home', 'library', 'quiet_room',
];
const BLOCKS = [20, 10, 20, 5, 30, 20, 10, 20, 20, 30, 10, 20, 20, 10];

// Six days get a second session, for 20 in total.
const EXTRA_SESSIONS = {
  5: { environment: 'home', planned: 30 },
  7: { environment: 'other', planned: 5 },
  8: { environment: 'classroom', planned: 20 },
  10: { environment: 'library', planned: 10 },
  12: { environment: 'quiet_room', planned: 20 },
  13: { environment: 'other', planned: 5 },
};

const TASKS = [
  'History essay outline', 'Algebra problem set', 'Chem lab write-up', 'Spanish vocab',
  'Reading chapter', 'Physics practice test', 'English annotations', 'Group project notes',
  'Math review', 'Biology flashcards', 'Essay draft', 'Study guide',
];
const START_TIMES = ['08:30', '09:15', '10:00', '11:30', '13:00', '14:45', '16:00', '17:30', '19:00', '20:15'];

const ENV_BASE = { quiet_room: 8.2, library: 7.5, home: 6.3, classroom: 5.6, other: 5.2 };
const BLOCK_BASE = { 5: 6.0, 10: 7.0, 20: 8.2, 30: 6.5 };

const NOTES = {
  2: 'Headphones helped a lot today.',
  6: 'Busy hallway before class, needed a quiet start.',
};

function lerp(a, b, t) { return a + (b - a) * t; }

export function generateDemoData(participantId) {
  const rng = mulberry32(20261026);
  const dailyObservations = [];
  const focusSessions = [];

  const buildSession = (date, sensory, environment, planned, seed) => {
    const target = ENV_BASE[environment] * 0.5
      + BLOCK_BASE[planned] * 0.5
      + (sensory >= 7 ? 0.9 : -0.9)
      + (rng() - 0.5) * 0.8;
    const breaks = planned >= 30
      ? 1 + Math.floor(rng() * 3)
      : planned >= 20 ? Math.round(rng() * 2) : Math.round(rng());
    return {
      date,
      start_time: START_TIMES[seed % START_TIMES.length],
      planned_minutes: planned,
      actual_minutes: Math.max(3, planned - Math.round(rng() * (planned >= 30 ? 6 : 3))),
      breaks_taken: breaks,
      focus_rating: clamp(Math.round(target), 1, 10),
      task_label: TASKS[seed % TASKS.length],
      environment,
      notes: '',
    };
  };

  let seed = 0;

  for (let k = 0; k < DAYS; k++) {
    const daysAgo = DAYS - 1 - k;
    const date = dateStr(daysAgo);
    const sensory = SENSORY[k];
    const ratio = (sensory - 4) / 5; // 0 = overloaded, 1 = comfortable
    const scale = (lo, hi) => clamp(Math.round(lerp(lo, hi, ratio) + (rng() - 0.5) * 1.4), 1, 10);

    dailyObservations.push({
      participant_id: participantId,
      date,
      sleep_quality: scale(5, 8),
      mood: scale(4.5, 8.5),
      energy: scale(4.5, 8),
      stress_anxiety: clamp(Math.round(11 - sensory + (rng() - 0.5) * 1.5), 1, 10),
      sensory_tolerance: sensory,
      engagement: scale(5, 8.5),
      dysregulation_events: clamp(Math.round(lerp(3, 0.4, ratio) + (rng() - 0.5) * 1.2), 0, 6),
      recovery_time_minutes: clamp(Math.round(lerp(35, 8, ratio) + (rng() - 0.5) * 8), 0, 90),
      notes: NOTES[k] || '',
    });

    focusSessions.push(buildSession(date, sensory, ENVIRONMENTS[k], BLOCKS[k], seed));
    seed++;

    const extra = EXTRA_SESSIONS[k];
    if (extra) {
      focusSessions.push(buildSession(date, sensory, extra.environment, extra.planned, seed));
      seed++;
    }
  }

  return { dailyObservations, focusSessions };
}