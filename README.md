# Steady

**Know your brain. Plan your day.**

Steady is a self check-in and focus app for neurodivergent high school students (ADHD, autism, sensory processing differences). Built by Sean Bandrapalli (Burlingame, CA) for the 2026 Congressional App Challenge.

## Why I built it

Autism and other forms of neurodivergence are being diagnosed more every year, but support hasn't kept up. Care is expensive, and most tools are built for clinics and caregivers, not for the student. During my internship at Sirica Therapeutics, a Bay Area health-tech company working on therapy for neurodivergent kids, I saw that gap firsthand. I built Steady so students can understand their own brains: notice when they're overloaded, find the setting and block length that help them focus, and have that information for themselves. I also want it to build awareness that neurodivergent students don't need fixing, they need tools that fit how they work.

## What it does

- **Daily Check-In.** Six quick sliders in under 30 seconds: sleep, mood, energy, how overwhelmed you feel, how you're handling noise, light and crowds, and how ready you are to focus.
- **Focus Timer.** Pick what you're working on, where you are, and a 5, 10, 20 or 30 minute block. Tap "I need a break" any time for a 2 minute reset. Rate your focus afterward.
- **Progress.** Charts of sensory tolerance vs. focus over 14 days, and focus by environment and block length.
- **Insights.** Plain-language patterns, like "Your focus ratings are 1.8 points higher on days your sensory tolerance is 7 or more" or "You focus best in the library." An insight only appears when there's enough data behind it.

## Privacy

No account, no server. Everything is stored in the browser's localStorage on the student's own device (`src/lib/db.js`). Nothing is sent anywhere.

Steady opens with a demo student so you can see how it works. Go to **Settings → Start fresh** to clear it and track yourself.

## Technical challenge

Students start a focus block and then switch tabs to do their work. Browsers throttle timers in background tabs, so a countdown that subtracts one second
