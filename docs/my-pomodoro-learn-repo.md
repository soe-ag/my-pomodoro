# Learn `my-pomodoro`

## Read in this order

1. `lib/pomodoro/constants.ts` — session types, durations, settings, and cycle length.
2. `lib/pomodoro/timer-logic.ts` — duration, next-session transitions, formatting, audio, and notifications.
3. `lib/pomodoro/storage.ts` — localStorage settings/history and derived daily/weekly statistics.
4. `lib/pomodoro/use-pomodoro.ts` — timer state machine, persistence, and public controller.
5. `app/page.tsx`, `components/pomodoro/pomodoro-dashboard.tsx`, then timer controls/display/stats.
6. Hook, timer-logic, storage, and stats tests — confirmation.

## Function map and UI trace

There is no server API. `PomodoroProvider` and `usePomodoro` expose the controller used by `pomodoro-dashboard.tsx`, `timer-controls.tsx`, `timer-display.tsx`, `stats.tsx`, and `settings.tsx`. The hook delegates transitions to `getNextSession` / `getSessionDuration` and persistence/statistics to `storage.ts`.

## Orchestration and local state

All meaningful state is client-side: settings and session records are stored locally, and `POMODORO_EVENT` synchronizes updates. The provider is the orchestration boundary; component files are mostly presentation and user-event adapters. `session-theme.ts` is display-only, while timer/storage modules contain business behavior.

## If you understand these files, you understand the repo

`lib/pomodoro/constants.ts`, `timer-logic.ts`, `storage.ts`, `use-pomodoro.ts`, `components/pomodoro/pomodoro-dashboard.tsx`, and `app/page.tsx`.
