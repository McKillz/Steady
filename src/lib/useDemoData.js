import { useParticipantData } from '@/lib/ParticipantContext';

// Backwards-compatible hook. Pages keep a simple return shape while the shared
// profile context keeps every page in sync with the signed-in student's data.
export function useDemoData() {
  const {
    loading,
    seeding,
    participant,
    observations,
    focusSessions,
    error,
    reload,
  } = useParticipantData();

  return { loading, seeding, participant, observations, focusSessions, error, reload };
}