"use client";

import { useEffect, useState } from "react";
import { Flame, History, Target } from "lucide-react";
import {
  DailyStats,
  POMODORO_EVENT,
  SessionRecord,
  getDailyStats,
  getToday,
  getWeeklyStats,
} from "@/lib/pomodoro/storage";
import { formatTime } from "@/lib/pomodoro/timer-logic";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  sessions: [],
  totalWorkTime: 0,
  sessionsCompleted: 0,
});

const createEmptyWeek = () => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return createEmptyDailyStats(date.toISOString().split("T")[0]);
  });
};

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

    window.addEventListener(POMODORO_EVENT.sessionAdded, update);
    window.addEventListener(POMODORO_EVENT.statsUpdated, update);
    window.addEventListener(POMODORO_EVENT.settingsSaved, update);

    return () => {
      window.removeEventListener(POMODORO_EVENT.sessionAdded, update);
      window.removeEventListener(POMODORO_EVENT.statsUpdated, update);
      window.removeEventListener(POMODORO_EVENT.settingsSaved, update);
    };
  }, []);

  const visibleToday = hasHydrated ? today : createEmptyDailyStats(getToday());
  const visibleWeek = hasHydrated ? week : createEmptyWeek();
  const totalSessions = visibleToday.sessions.length;
  const completionRate =
    totalSessions > 0
      ? Math.round((visibleToday.sessionsCompleted / totalSessions) * 100)
      : 0;
  const maxCompleted = Math.max(
    ...visibleWeek.map((day) => day.sessionsCompleted),
    1,
  );

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Today&apos;s output
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {visibleToday.sessionsCompleted} completed focus sessions
            </h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 p-3 text-rose-200">
            <Flame className="size-5" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Target className="size-4" /> Completion
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{completionRate}%</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <div className="text-sm text-slate-300">Total work time</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {formatTime(visibleToday.totalWorkTime)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <History className="size-4" /> Logged sessions
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{totalSessions}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Last 7 days</p>
        <div className="mt-5 flex h-40 items-end gap-3">
          {visibleWeek.map((day) => {
            const height = `${Math.max(10, (day.sessionsCompleted / maxCompleted) * 100)}%`;

            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-slate-400">
                  {day.sessionsCompleted > 0 ? day.sessionsCompleted : ""}
                </span>
                <div className="flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-2xl ${getBarClassName(day.sessions)} transition-all duration-300`}
                    style={{ height }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {dayLabels[new Date(day.date).getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Stats;
