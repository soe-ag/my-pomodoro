"use client";

import Link from "next/link";
import { ChartNoAxesColumn, Settings2 } from "lucide-react";
import { Stats } from "./stats";
import { TimerControls } from "./timer-controls";
import { TimerDisplay } from "./timer-display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SESSION_TYPES } from "@/lib/pomodoro/constants";
import { getSessionTheme } from "@/lib/pomodoro/session-theme";
import { usePomodoro } from "@/lib/pomodoro/use-pomodoro";

export function PomodoroDashboard() {
  const {
    currentDuration,
    isRunning,
    pause,
    reset,
    selectSession,
    sessionType,
    sessionsCompleted,
    settings,
    start,
    timeRemaining,
  } = usePomodoro();

  const sessionTheme = getSessionTheme(sessionType);
  const completedInCycle = sessionsCompleted % 4;
  const nextLongBreakIn = completedInCycle === 0 ? 4 : 4 - completedInCycle;

  return (
    <div className="w-full space-y-6">
      <Card
        className={`overflow-hidden rounded-[2rem] border bg-slate-950/75 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur sm:p-8 ${sessionTheme.panelClassName}`}
      >
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-slate-200">
                  Pomodoro Rhythm
                </span>
                <span>{sessionsCompleted} focus blocks finished today</span>
              </div>

              <div className="max-w-2xl space-y-3">
                <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Build a steadier focus loop instead of chasing urgency.
                </h2>
                <p className="text-base leading-7 text-slate-300 sm:text-lg">
                  One deep module now owns timer flow, session rules, and notifications. The UI is lighter, and the work rhythm is clearer.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((type) => {
                const theme = getSessionTheme(type);
                const isActive = sessionType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => selectSession(type)}
                    disabled={isRunning}
                    className={[
                      "rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                      isActive
                        ? `border-transparent bg-linear-to-r ${theme.buttonClassName}`
                        : "border-white/12 bg-white/6 text-slate-200 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {theme.shortLabel}
                  </button>
                );
              })}
            </div>

            <TimerDisplay
              timeRemaining={timeRemaining}
              sessionType={sessionType}
              sessionDuration={currentDuration}
            />

            <TimerControls
              isRunning={isRunning}
              onPause={pause}
              onReset={reset}
              onStart={start}
              sessionType={sessionType}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Cycle status</p>
              <div className="mt-3 text-3xl font-semibold text-white">
                {completedInCycle}/4
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {nextLongBreakIn} more completed focus session{nextLongBreakIn === 1 ? "" : "s"} until the next long break.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Current durations</p>
              <dl className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <dt>Focus</dt>
                  <dd>{Math.round(settings.workDuration / 60)} min</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Short break</dt>
                  <dd>{Math.round(settings.breakDuration / 60)} min</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Long break</dt>
                  <dd>{Math.round(settings.longBreakDuration / 60)} min</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/12 bg-white/6 text-white hover:bg-white/10"
              >
                <Link href="/settings">
                  <Settings2 className="size-4" />
                  Tune settings
                </Link>
              </Button>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">
                <ChartNoAxesColumn className="size-4" />
                Daily stats update automatically
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Stats />
    </div>
  );
}
