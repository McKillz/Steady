// Steady's on-device data store.
//
// Everything a student logs (their profile, daily check-ins and focus sessions)
// is saved in this browser's localStorage. There is no server and no account:
// nothing leaves the student's device.
//
// Each table is stored as a JSON array under its own key, e.g. "steady:FocusSession".

const PREFIX = 'steady:';
const TABLES = ['Participant', 'DailyObservation', 'FocusSession'];

function readTable(name) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTable(name, rows) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(rows));
  } catch {
    // Storage full or blocked (private mode). The app keeps working for this visit.
  }
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// sort: "date" for oldest first, "-date" for newest first.
function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
    return desc ? -cmp : cmp;
  });
}

function matches(row, query = {}) {
  return Object.entries(query).every(([k, v]) => row[k] === v);
}

function makeTable(name) {
  return {
    async list({ sort, limit } = {}) {
      const rows = sortRows(readTable(name), sort);
      return limit ? rows.slice(0, limit) : rows;
    },
    async filter(query, { sort, limit } = {}) {
      const rows = sortRows(readTable(name).filter((r) => matches(r, query)), sort);
      return limit ? rows.slice(0, limit) : rows;
    },
    async create(data) {
      const row = { ...data, id: newId(), created_date: new Date().toISOString() };
      writeTable(name, [...readTable(name), row]);
      return row;
    },
    async bulkCreate(items) {
      const now = new Date().toISOString();
      const rows = items.map((d) => ({ ...d, id: newId(), created_date: now }));
      writeTable(name, [...readTable(name), ...rows]);
      return rows;
    },
    async update(id, data) {
      let updated = null;
      const rows = readTable(name).map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...data, id };
        return updated;
      });
      writeTable(name, rows);
      return updated;
    },
    async deleteMany(query) {
      writeTable(name, readTable(name).filter((r) => !matches(r, query)));
    },
  };
}

export const db = Object.fromEntries(TABLES.map((t) => [t, makeTable(t)]));

// Wipes every Steady table on this device (used by "Start fresh" in Settings).
export function clearAllData() {
  TABLES.forEach((t) => {
    try { localStorage.removeItem(PREFIX + t); } catch { /* ignore */ }
  });
}
