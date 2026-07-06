# Repo Learning Guide

## Read In This Order

1. `lib/pomodoro/constants.ts`
   Domain types: `SessionType`, `PomodoroSettings`, defaults, and the 4-focus-session cycle rule.

2. `lib/pomodoro/storage.ts`
   Local persistence layer. This app has no backend; `localStorage` plus `window` events act as the data/API layer.

3. `lib/pomodoro/timer-logic.ts`
   Pure timer rules, formatting, next-session calculation, audio, and browser notification helpers.

4. `lib/pomodoro/use-pomodoro.ts`
   Main orchestration module. Owns countdown state, session transitions, settings sync, completion recording, sound, notifications, and the React context API.

5. `app/layout.tsx`
   Wraps the whole app in `PomodoroProvider`, so the timer survives route changes.

6. `components/pomodoro/pomodoro-dashboard.tsx`
   Main container UI for `/`. Calls `usePomodoro()` and wires timer state into display, controls, and stats.

7. `components/pomodoro/settings.tsx` and `components/pomodoro/stats.tsx`
   Settings writes persisted config. Stats reads persisted records and listens for storage events.

## Function Map

### `lib/pomodoro/storage.ts`

- `loadSettings()` reads `pomodoro-settings` from `localStorage`.
- `saveSettings()` writes settings only.
- `saveSettingsAndNotify()` writes settings and dispatches `pomodoro:settings-saved`.
- `getDailyStats()` reads `pomodoro-stats-YYYY-MM-DD`.
- `saveDailyStats()` writes stats and dispatches `pomodoro:stats-updated`.
- `addSessionRecord()` appends a session, increments work totals only for completed work sessions, and dispatches `pomodoro:session-added`.
- `getWeeklyStats()` builds the last 7 days from local storage.
- `requestNotificationPermission()` asks browser notification permission.

### `lib/pomodoro/timer-logic.ts`

- `formatTime()` formats seconds as `MM:SS`.
- `getSessionDuration()` maps session type to configured duration.
- `getNextSession()` implements work -> break/long-break and break -> work transitions.
- `unlockAudio()`, `playChirpSound()`, and `playNotificationSound()` handle sound.
- `sendBrowserNotification()` sends browser notifications when permission is granted.

### `lib/pomodoro/use-pomodoro.ts`

- `PomodoroProvider` exposes timer state app-wide.
- `usePomodoro()` is the public hook used by UI.
- `start()` creates an absolute deadline from `Date.now()`.
- `pause()` syncs from the deadline and stops.
- `reset()` restores current session duration.
- `selectSession()` switches session, asking confirmation if current timer has progress.
- Internal `syncRunningState()` derives remaining time from `deadlineAt`, preventing tab throttling drift.

## Frontend Call Sites

- `usePomodoro()` is called in `components/pomodoro/pomodoro-dashboard.tsx`.
- `pomodoro-dashboard.tsx` passes state into `timer-display.tsx` for formatted time and progress.
- `pomodoro-dashboard.tsx` passes actions into `timer-controls.tsx` for start, pause, and reset.
- Session buttons in `pomodoro-dashboard.tsx` call `selectSession()`.
- `saveSettingsAndNotify()` is called in `components/pomodoro/settings.tsx`.
- `use-pomodoro.ts` listens for `pomodoro:settings-saved` and updates live timer settings.
- `addSessionRecord()` is called in `use-pomodoro.ts` when a session completes.
- `stats.tsx` listens for stats/session events and refreshes today plus weekly stats.
- `getDailyStats()` and `getWeeklyStats()` are called in `stats.tsx`.

## File Roles

- Route files: `app/layout.tsx`, `app/page.tsx`, `app/settings/page.tsx`.
- Orchestration: `lib/pomodoro/use-pomodoro.ts`, `components/pomodoro/pomodoro-dashboard.tsx`.
- Domain and persistence: `lib/pomodoro/constants.ts`, `lib/pomodoro/storage.ts`, `lib/pomodoro/timer-logic.ts`.
- Display and leaf components: `components/pomodoro/timer-display.tsx`, `components/pomodoro/timer-controls.tsx`, `components/pomodoro/stats.tsx`.
- Styling helpers: `lib/pomodoro/session-theme.ts`, UI primitives under `components/ui`.

## Tests To Read Last

- `lib/pomodoro/timer-logic.test.ts` validates pure formatting, session rules, and audio behavior.
- `lib/pomodoro/storage.test.ts` validates localStorage stats and settings behavior.
- `lib/pomodoro/use-pomodoro.test.tsx` validates countdown, session completion, settings sync, tab/deadline behavior.
- `components/pomodoro/stats.test.tsx` validates hydration-safe stats rendering.

## Minimum Mental Model

If you understand these files, you understand the repo:

- `lib/pomodoro/constants.ts`
- `lib/pomodoro/storage.ts`
- `lib/pomodoro/timer-logic.ts`
- `lib/pomodoro/use-pomodoro.ts`
- `components/pomodoro/pomodoro-dashboard.tsx`

