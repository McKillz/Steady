# Steady

**Know your brain. Plan your day.**

Steady is a self check-in and focus app for neurodivergent high school students (ADHD, autism, sensory processing differences). Built by Sean Bandrapalli (Burlingame, CA) for the 2026 Congressional App Challenge.

## What it does

- **Daily Check-In.** Six quick sliders in under 30 seconds: sleep, mood, energy, how overwhelmed you feel, how you're handling noise, light and crowds, and how ready you are to focus.
- **Focus Timer.** Pick what you're working on, where you are, and a 5, 10, 20 or 30 minute block. Tap "I need a break" any time for a 2 minute reset. Rate your focus afterward.
- **Progress.** Charts of sensory tolerance vs. focus over 14 days, and focus by environment and block length.
- **Insights.** Plain-language patterns, like "Your focus ratings are 1.8 points higher on days your sensory tolerance is 7 or more" or "You focus best in the library." An insight only appears when there's enough data behind it.

## Privacy

No account, no server. Everything is stored in the browser's localStorage on the student's own device (`src/lib/db.js`). Nothing is sent anywhere.

Steady opens with a demo student so you can see how it works. Go to **Settings → Start fresh** to clear it and track yourself.

## Technical challenge

Students start a focus block and then switch tabs to do their work. Browsers throttle timers in background tabs, so a countdown that subtracts one second per tick falls behind. The timer now stores the block's end timestamp and calculates the remaining time from `Date.now()`, so it stays accurate in the background. It also saves its state to localStorage so it survives page changes and refreshes, and it sends a chime and browser notification when a block or break ends.

## How it was built (AI disclosure)

- I designed the app: the problem, the audience, the features and the flow.
- The first version was generated with **Base44**, an AI app builder, from prompts I wrote.
- I used **Claude** (AI) to help review the code, fix the background-tab timer issue, and convert the app into a standalone React app with on-device storage instead of Base44's backend.
- By hand, I: [list what you changed yourself, e.g. the About page text, focus block lengths]

## Tech stack

React, Vite, Tailwind CSS, Recharts, Radix UI components, localStorage.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Deploy

Works on Vercel or Netlify with no setup: build command `npm run build`, output folder `dist`.

*Steady is a student prototype, not medical advice.*
