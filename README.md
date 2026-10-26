# Steady

**Know your brain. Plan your day.**

Steady is a self check-in and focus app for neurodivergent high school students (ADHD, autism, sensory processing differences). Built by Sean Bandrapalli (Burlingame, CA) for the 2026 Congressional App Challenge.

**Live app:** https://steady-blue.vercel.app

## Why I built it

Autism and other forms of neurodivergence are being diagnosed more every year, but support hasn't kept up. Care is expensive, and most tools are built for clinics and caregivers, not for the student. During my internship at Sirica Therapeutics, a Bay Area health-tech company working on therapy for neurodivergent kids, I saw that gap firsthand. I built Steady so students can understand their own brains: notice when they're overloaded, find the setting and block length that help them focus, and have that information for themselves. I also want it to build awareness that neurodivergent students don't need fixing, they need tools that fit how they work.

## What it does

- **Daily Check-In.** Six quick sliders in under 30 seconds: sleep, mood, energy, how overwhelmed you feel, how you're handling noise, light and crowds, and how ready you are to focus.
- **Focus Timer.** Pick what you're working on, where you are, and a 5, 10, 20 or 30 minute block. Tap "I need a break" any time for a 2 minute reset with a calming tip. Rate your focus afterward.
- **Progress.** Charts of sensory tolerance vs. focus over 14 days, and focus by environment and block length.
- **Insights.** Plain-language patterns, like "Your focus ratings are 1.8 points higher on days your sensory tolerance is 7 or more" or "You focus best in the library." An insight only appears when there's enough data behind it.

## Privacy

No account, no server. Everything is stored in the browser's localStorage on the student's own device (`src/lib/db.js`). Nothing is sent anywhere.

Steady opens with a demo student so you can see how it works. Go to **Settings → Start fresh** to clear it and track yourself.

## Technical challenge

Students start a focus block and then switch tabs to do their work. Browsers throttle timers in background tabs, so a countdown that subtracts one second per tick falls behind. The timer now stores the block's end timestamp and calculates the remaining time from `Date.now()`, so it stays accurate in the background. It also saves its state to localStorage so it survives page changes and refreshes, and it sends a chime and browser notification when a block or break ends.

## How I built it

Steady was inspired by my internship at Sirica Therapeutics, where I saw that most tools for neurodivergent kids are built for clinics and caregivers, not the student. I researched autism prevalence and cost data and designed the app around what a neurodivergent student would actually use: simple sliders instead of typing, a check-in under 30 seconds, short focus blocks, and a calm, low-clutter interface. I directed every page and feature, rebuilt it as a student's own tool, and removed accounts and servers so data stays on the student's device. I added rotating break tips to the Focus Timer, tested the app, deployed it on GitHub and Vercel, and wrote the app's content.

**AI tools used:** Base44 (AI app builder) generated the initial code from my prompts. Claude helped fix a timer bug and convert the app to standalone React.

## Feedback and what's next

I had friends test Steady. One suggested adding more sound and visual rewards (colors, confetti) to work as a reward system, plus an avatar to help guide students through the app. Next I plan to add these as optional settings, since some neurodivergent students are sensitive to sound and motion.

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

*Steady is a student prototype, not medical advice.* in background tabs, so a countdown that subtracts one second
