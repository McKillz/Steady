import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { generateDemoData } from '@/lib/demoData';

const sortByDate = (arr, key) => [...arr].sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
const pageItems = (res) => (Array.isArray(res) ? res : (res?.items ?? []));

const ParticipantContext = createContext(null);

// The signed-in student is the only person tracked. Their single Participant
// record is their own profile; this context also loads the check-ins and focus
// sessions that belong to them.
export function ParticipantProvider({ children }) {
  const [participant, setParticipant] = useState(null);
  const [observations, setObservations] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async (part) => {
    // Newest first with an explicit cap, so the most recent records are the ones
    // that survive the page — then sorted oldest → newest for the charts.
    const [obs, focus] = await Promise.all([
      db.DailyObservation.filter({ participant_id: part.id }, { sort: '-date', limit: 100 }),
      db.FocusSession.list({ sort: '-date', limit: 100 }),
    ]);
    const sortedObs = sortByDate(pageItems(obs), 'date');
    const sortedFocus = sortByDate(pageItems(focus), 'date');
    setObservations(sortedObs);
    setFocusSessions(sortedFocus);
    return { obs: sortedObs, focus: sortedFocus };
  }, []);

  // The demo student's 14 days of check-ins and 20 focus sessions.
  const seedDemoContent = useCallback(async (participantId) => {
    const gen = generateDemoData(participantId);
    await db.DailyObservation.bulkCreate(gen.dailyObservations);
    await db.FocusSession.bulkCreate(gen.focusSessions);
  }, []);

  // Prefer the demo profile so the prototype always opens on the same student.
  const pickProfile = (parts) => parts.find((p) => p.is_demo) || parts[0] || null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let parts = await db.Participant.list();
        if (parts.length === 0) {
          setSeeding(true);
          await db.Participant.create({
            name: 'Jordan Rivera',
            age: 16,
            is_demo: true,
            sensory_considerations: 'Loud, busy rooms drain me. Headphones and a quiet corner help me settle.',
            current_goals: 'Start homework earlier, take a break before I burn out, and notice sooner when I need one.',
            notes: 'Synthetic demo student for the Steady prototype.',
          });
          parts = await db.Participant.list();
        }
        if (cancelled) return;

        const chosen = pickProfile(parts);
        if (!chosen) return;
        setParticipant(chosen);
        const loaded = await loadAll(chosen);
        if (cancelled) return;

        // A fresh account, or a demo profile still holding the older synthetic
        // set: give the demo student the current 14-day / 20-session dataset so
        // the charts and patterns show something real. A profile that already
        // has focus sessions is left untouched.
        if (chosen.is_demo && loaded.focus.length === 0) {
          if (loaded.obs.length) {
            await db.DailyObservation.deleteMany({ participant_id: chosen.id });
          }
          await seedDemoContent(chosen.id);
          await loadAll(chosen);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) {
          setSeeding(false);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-read the profile and its related data (after editing the profile, logging
  // a check-in, or saving a focus session).
  const reload = useCallback(async () => {
    const parts = await db.Participant.list();
    const current = participant ? parts.find((p) => p.id === participant.id) : pickProfile(parts);
    if (!current) return;
    setParticipant(current);
    await loadAll(current);
  }, [participant, loadAll]);

  const value = {
    participant,
    observations,
    focusSessions,
    loading,
    seeding,
    error,
    reload,
  };

  return <ParticipantContext.Provider value={value}>{children}</ParticipantContext.Provider>;
}

export function useParticipantData() {
  const ctx = useContext(ParticipantContext);
  if (!ctx) throw new Error('useParticipantData must be used within a ParticipantProvider');
  return ctx;
}
