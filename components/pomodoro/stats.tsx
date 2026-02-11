"use client";

import { useEffect, useState } from "react";
import { getDailyStats, getWeeklyStats } from "@/lib/pomodoro/storage";
import { formatTime } from "@/lib/pomodoro/timer-logic";

interface DayStat {
  date: string;
  sessionsCompleted: number;
}

export function Stats() {
  const [today, setToday] = useState(() => getDailyStats());
  const [week, setWeek] = useState(() => getWeeklyStats());

  useEffect(() => {
    const update = () => {
      setToday(getDailyStats());
      setWeek(getWeeklyStats());
    };

    update();

    window.addEventListener("pomodoro:session-added", update);
    window.addEventListener("pomodoro:stats-updated", update);
    window.addEventListener("pomodoro:settings-saved", update);

    return () => {
      window.removeEventListener("pomodoro:session-added", update);
      window.removeEventListener("pomodoro:stats-updated", update);
      window.removeEventListener("pomodoro:settings-saved", update);
    };
  }, []);

  const totalSessions = today.sessions?.length || 0;
  const sessionsCompleted = Number(today.sessionsCompleted || 0);
  const completionRate =
    totalSessions > 0
      ? Math.round((sessionsCompleted / totalSessions) * 100)
      : 0;

  const maxCompleted = Math.max(
    ...week.map((d) => Number(d.sessionsCompleted || 0)),
    1,
  );

  const gradientFor = (type: string | undefined) => {
    switch (type) {
      case "work":
        return "bg-linear-to-r from-blue-600 to-purple-600";
      case "break":
        return "bg-linear-to-r from-emerald-500 to-green-600";
      case "long-break":
        return "bg-linear-to-r from-blue-400 to-blue-400";
      default:
        return "bg-gray-400/70";
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Today's Stats</div>
            {today.sessions.length === 0 ? (
              <div className="text-sm text-gray-500">
                No sessions recorded today
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold">
                  {sessionsCompleted}
                </div>
                <div className="text-sm text-gray-500">Sessions completed</div>
              </>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Total work time</div>
            <div className="text-2xl font-semibold">
              {formatTime(today.totalWorkTime)}
            </div>
            <div className="text-sm text-gray-500">
              Completion: {completionRate}%
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">Last 7 days</div>
          {week.every((d) => Number(d.sessionsCompleted || 0) === 0) ? (
            <div className="text-sm text-gray-500">
              No records for the last 7 days
            </div>
          ) : (
            <div className="flex items-end gap-2 h-28">
              <div className="mr-3 text-xs text-gray-500 flex flex-col justify-between h-full">
                <div>{maxCompleted}</div>
                <div className="opacity-70">{Math.ceil(maxCompleted / 2)}</div>
                <div>0</div>
              </div>
              <div className="flex-1 grid grid-cols-7 gap-2 items-end">
                {week.map((d) => {
                  const sessions = d.sessions || [];
                  const hasWork = sessions.some((s: any) => s.type === "work");
                  const hasLong = sessions.some(
                    (s: any) => s.type === "long-break",
                  );
                  const hasBreak = sessions.some(
                    (s: any) => s.type === "break",
                  );
                  const colorClass = hasWork
                    ? gradientFor("work") + " shadow-md"
                    : hasLong
                      ? gradientFor("long-break") + " shadow-md"
                      : hasBreak
                        ? gradientFor("break") + " shadow-md"
                        : "bg-gray-400/70";
                  const count = Number(d.sessionsCompleted || 0);
                  return (
                    <div key={d.date} className="text-center">
                      <div className="text-xs text-gray-200 mb-1">
                        {count > 0 ? count : ""}
                      </div>
                      <div
                        className={`mx-auto ${colorClass} rounded-t-sm transition-all`}
                        style={{
                          height: `${(count / Math.max(1, maxCompleted)) * 100}%`,
                          width: "100%",
                          maxWidth: 36,
                          minHeight: count > 0 ? 12 : 4,
                        }}
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                            new Date(d.date).getDay()
                          ]
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stats;
