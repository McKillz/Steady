// Soft chime + browser notification for the focus timer.
// The audio context is created during a user gesture (Start focus) so the
// chime is still allowed to play when the tab is in the background.

let ctx = null;

const getContext = () => {
  if (ctx) return ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  ctx = new Ctx();
  return ctx;
};

// Call from a click handler to unlock audio for later background playback.
export function unlockAudio() {
  try {
    const context = getContext();
    if (context && context.state === 'suspended') context.resume();
  } catch {
    /* audio is optional */
  }
}

export function requestNotificationPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  } catch {
    /* notifications are optional */
  }
}

export function showTimerNotification(message) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    new Notification('Steady', { body: message, tag: 'steady-timer' });
  } catch {
    /* notifications are optional */
  }
}

// A short, soft two-note chime built with the Web Audio API.
export function playChime() {
  try {
    const context = getContext();
    if (!context) return;
    if (context.state === 'suspended') context.resume();
    const start = context.currentTime;
    [880, 1174.66].forEach((frequency, i) => {
      const at = start + i * 0.18;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
      osc.connect(gain).connect(context.destination);
      osc.start(at);
      osc.stop(at + 1);
    });
  } catch {
    /* audio is optional */
  }
}

// Fires when the student is in another tab and the page was reloaded while away:
// a completed block is caught up on the next tick, not here.
export const focusDoneMessage = 'Focus block done — how did it go?';
export const breakDoneMessage = "Break's over — back to it";