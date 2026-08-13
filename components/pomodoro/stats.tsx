"use client";

import { useEffect, useState } from "react";
import { Flame, History, Target } from "lucide-react";
import {
  DailyStats,
  POMODORO_EVENT,
  SessionRecord,
  getDailyStats,
  getRecentDateKeys,
  getToday,
  getWeeklyStats,
} from "@/lib/pomodoro/storage";
import { formatTime } from "@/lib/pomodoro/timer-logic";

const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });

const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  sessions: [],
  totalWorkTime: 0,
  sessionsCompleted: 0,
});

const createEmptyWeek = () => {
  return getRecentDateKeys(7).map(createEmptyDailyStats);
};

const formatDayLabel = (date: string): string =>
  dayFormatter.format(new Date(`${date}T00:00:00`));

const getBarClassName = (sessions: SessionRecord[]) => {
  if (sessions.some((session) => session.type === "work")) {
    return "bg-linear-to-t from-rose-500 to-amber-300";
  }

  if (sessions.some((session) => session.type === "long-break")) {
    return "bg-linear-to-t from-sky-500 to-indigo-200";
  }

  if (sessions.some((session) => session.type === "break")) {
    return "bg-linear-to-t from-emerald-500 to-cyan-200";
  }

  return "bg-white/10";
};

export function Stats() {
  const [today, setToday] = useState<DailyStats>(() =>
    createEmptyDailyStats(getToday()),
  );
  const [week, setWeek] = useState<DailyStats[]>(createEmptyWeek);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const update = () => {
      setToday(getDailyStats());
      setWeek(getWeeklyStats());
    };

    queueMicrotask(() => {
      update();
      setHasHydrated(true);
    });

    window.addEventListener(POMODORO_EVENT.statsUpdated, update);

    return () => {
      window.removeEventListener(POMODORO_EVENT.statsUpdated, update);
    };
  }, []);

  const visibleToday = hasHydrated ? today : createEmptyDailyStats(getToday());
  const visibleWeek = hasHydrated ? week : createEmptyWeek();
  const totalSessions = visibleToday.sessions.length;
  const completedSessions = visibleToday.sessions.filter(
    (session) => session.completed,
  ).length;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
  const maxCompleted = Math.max(
    ...visibleWeek.map((day) => day.sessionsCompleted),
    1,
  );

  return (
    <section aria-label="Focus Statistics" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Today&apos;s Output
            </p>
            <h2 className="mt-2 text-pretty text-2xl font-semibold text-white">
              {visibleToday.sessionsCompleted} completed focus sessions
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 p-3 text-rose-200">
            <Flame aria-hidden="true" className="size-5" />
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <dt className="flex items-center gap-2 text-sm text-slate-300">
              <Target aria-hidden="true" className="size-4" /> Completion
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-white tabular-nums">{completionRate}%</dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <dt className="text-sm text-slate-300">Total Work Time</dt>
            <dd className="mt-2 font-mono text-2xl font-semibold text-white tabular-nums">
              {formatTime(visibleToday.totalWorkTime)}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <dt className="flex items-center gap-2 text-sm text-slate-300">
              <History aria-hidden="true" className="size-4" /> Logged Sessions
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-white tabular-nums">{totalSessions}</dd>
          </div>
        </dl>
      </div>

      <figure className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
        <figcaption className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Last 7 Days
        </figcaption>
        <div
          aria-label={`Completed focus sessions over the last 7 days: ${visibleWeek
            .map((day) => `${formatDayLabel(day.date)} ${day.sessionsCompleted}`)
            .join(", ")}`}
          className="mt-5 flex h-40 items-end gap-2 sm:gap-3"
          role="img"
        >
          {visibleWeek.map((day) => {
            const height =
              day.sessionsCompleted === 0
                ? "0%"
                : `${Math.max(10, (day.sessionsCompleted / maxCompleted) * 100)}%`;

            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <span aria-hidden="true" className="text-xs text-slate-400 tabular-nums">
                  {day.sessionsCompleted > 0 ? day.sessionsCompleted : ""}
                </span>
                <div className="flex h-full w-full items-end">
                  <div
                    aria-hidden="true"
                    className={`w-full rounded-t-2xl ${getBarClassName(day.sessions)} transition-[height] duration-300`}
                    style={{ height }}
                    title={`${formatDayLabel(day.date)}: ${day.sessionsCompleted} focus sessions`}
                  />
                </div>
                <span aria-hidden="true" className="text-xs text-slate-500">
                  {formatDayLabel(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </figure>
    </section>
  );
}

export default Stats;
