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
    setToday(getDailyStats());
    setWeek(getWeeklyStats());
  }, []);

  const totalSessions = today.sessions.length;
  const sessionsCompleted = today.sessionsCompleted || 0;
  const completionRate =
    totalSessions > 0
      ? Math.round((sessionsCompleted / totalSessions) * 100)
      : 0;

  const maxCompleted = Math.max(...week.map((d) => d.sessionsCompleted), 1);

  return (
    <div className="mt-6">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Today's Stats</div>
            <div className="text-2xl font-semibold">{sessionsCompleted}</div>
            <div className="text-sm text-gray-500">Sessions completed</div>
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
          <div className="flex items-end gap-2 h-24">
            {week.map((d) => (
              <div key={d.date} className="flex-1 text-center">
                <div
                  className="mx-auto bg-blue-500 rounded-t-sm"
                  style={{
                    height: `${(d.sessionsCompleted / maxCompleted) * 100}%`,
                    width: "100%",
                    maxWidth: 36,
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(d.date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
