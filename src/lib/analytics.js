// Analytics helpers for the Steady prototype.
// Everything here summarises the student's own check-ins and focus sessions.
// Nothing is a clinical measure.

export function avg(arr, key) {
  if (!arr || !arr.length) return 0;
  return arr.reduce((s, x) => s + (Number(x[key]) || 0), 0) / arr.length;
}
export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
export function round1(n) { return Math.round(n * 10) / 10; }

export function lastN(arr, n, dateKey) {
  const sorted = [...arr].sort((a, b) => (a[dateKey] || '').localeCompare(b[dateKey] || ''));
  return sorted.slice(-n);
}

// Local-date helpers — avoids the UTC rollover that would shift "today" in the evening.
export function dateStr(daysAgo = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function todayStr() { return dateStr(0); }
export function shortDate(value) {
  if (!value) return '';
  const [, m, d] = value.split('-');
  return `${Number(m)}/${Number(d)}`;
}

const ENV_LABELS = { quiet_room: 'Quiet room', classroom: 'Classroom', library: 'Library', home: 'Home', outside: 'Outside', other: 'Other' };
const ENV_PHRASING = {
  quiet_room: 'in a quiet room',
  classroom: 'in the classroom',
  library: 'in the library',
  home: 'at home',
  outside: 'outside',
  other: 'in other settings',
};

export function focusSessionsSince(sessions, days) {
  const cutoff = dateStr(days - 1);
  return (sessions || []).filter((s) => (s.date || '') >= cutoff);
}
export function totalFocusMinutes(sessions) {
  return Math.round((sessions || []).reduce((sum, s) => sum + (Number(s.actual_minutes) || 0), 0));
}
export function averageFocusRating(sessions) {
  return sessions && sessions.length ? round1(avg(sessions, 'focus_rating')) : 0;
}

// Sensory tolerance from the daily check-in, next to that day's average focus rating.
export function dailyFocusSeries(observations, focusSessions, days = 14) {
  const byDate = {};
  (focusSessions || []).forEach((s) => {
    if (!s.date) return;
    (byDate[s.date] = byDate[s.date] || []).push(Number(s.focus_rating) || 0);
  });
  return lastN(observations || [], days, 'date').map((o) => {
    const ratings = byDate[o.date] || [];
    return {
      label: shortDate(o.date),
      sensory: o.sensory_tolerance ?? null,
      focus: ratings.length ? round1(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
    };
  });
}

export function ratingByEnvironment(sessions) {
  return Object.keys(ENV_LABELS)
    .map((value) => {
      const rows = (sessions || []).filter((s) => s.environment === value);
      return {
        value,
        label: ENV_LABELS[value],
        rating: rows.length ? round1(avg(rows, 'focus_rating')) : 0,
        count: rows.length,
      };
    })
    .filter((r) => r.count > 0);
}

export function ratingByBlockLength(sessions) {
  const blocks = [...new Set((sessions || []).map((s) => Number(s.planned_minutes)).filter(Boolean))]
    .sort((a, b) => a - b);
  return blocks.map((minutes) => {
    const rows = (sessions || []).filter((s) => Number(s.planned_minutes) === minutes);
    return {
      minutes,
      label: `${minutes} min`,
      rating: rows.length ? round1(avg(rows, 'focus_rating')) : 0,
      count: rows.length,
    };
  });
}

// Student-facing patterns, shown only where there is enough data to support them.
export function buildInsights(observations, focusSessions) {
  const sessions = [...(focusSessions || [])];
  if (sessions.length < 5) return ['Do a few more focus sessions to unlock patterns.'];

  const out = [];
  const overall = avg(sessions, 'focus_rating');

  const obsByDate = {};
  (observations || []).forEach((o) => { if (o.date) obsByDate[o.date] = o; });
  const sensoryOf = (s) => {
    const o = obsByDate[s.date];
    const v = o ? Number(o.sensory_tolerance) : NaN;
    return Number.isFinite(v) ? v : null;
  };

  const settled = sessions.filter((s) => sensoryOf(s) !== null && sensoryOf(s) >= 7);
  const overloaded = sessions.filter((s) => sensoryOf(s) !== null && sensoryOf(s) < 7);
  if (settled.length >= 3 && overloaded.length >= 3) {
    const gap = round1(avg(settled, 'focus_rating') - avg(overloaded, 'focus_rating'));
    if (gap >= 0.5) {
      out.push(`Your focus ratings are ${gap} points higher on days your sensory tolerance is 7 or more.`);
    } else if (gap <= -0.5) {
      out.push(`Your focus ratings are ${Math.abs(gap)} points lower on days your sensory tolerance is 7 or more.`);
    }
  }

  const bestEnv = ratingByEnvironment(sessions)
    .filter((r) => r.count >= 2)
    .sort((a, b) => b.rating - a.rating)[0];
  if (bestEnv && bestEnv.rating - overall >= 0.5) {
    out.push(`You focus best ${ENV_PHRASING[bestEnv.value] || 'in that setting'}.`);
  }

  const bestBlock = ratingByBlockLength(sessions)
    .filter((r) => r.count >= 2)
    .sort((a, b) => b.rating - a.rating)[0];
  if (bestBlock && bestBlock.rating - overall >= 0.5) {
    out.push(`Your ${bestBlock.minutes}-minute blocks get your highest focus ratings.`);
  }

  if (!out.length) {
    out.push('Your focus ratings look steady across your recent sessions. Keep logging to spot what works best.');
  }
  return out;
}
