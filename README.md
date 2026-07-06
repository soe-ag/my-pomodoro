# My Pomodoro

A refined Pomodoro timer built with Next.js, React, TypeScript, and Tailwind CSS.
It focuses on a stronger timer module design, clearer session flow, and lightweight local persistence for daily stats.

## Features

- Configurable focus, short break, and long break durations
- Start, pause, reset, and manual session switching
- Automatic session progression with long-break cadence
- Toast and desktop notifications
- Daily stats and a 7-day activity view
- Responsive interface for desktop and mobile

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui primitives
- localStorage for settings and stats

## Project Structure

```text
app/                   Next.js routes and global styles
components/pomodoro/   Timer UI and stats widgets
components/ui/         Shared UI primitives
lib/pomodoro/          Timer rules, storage, theme metadata, hook
lib/                   Shared utilities
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npm run build
```
