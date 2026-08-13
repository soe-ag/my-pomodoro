"use client";

import { memo } from "react";
import { SESSION_TYPES, type SessionType } from "@/lib/pomodoro/constants";
import { getSessionTheme } from "@/lib/pomodoro/session-theme";

interface SessionSelectorProps {
  sessionType: SessionType;
  isRunning: boolean;
  onSelect: (sessionType: SessionType) => void;
}

export const SessionSelector = memo(function SessionSelector({
  sessionType,
  isRunning,
  onSelect,
}: SessionSelectorProps) {
  return (
    <div aria-label="Session Type" className="flex flex-wrap gap-2" role="group">
      {SESSION_TYPES.map((type) => {
        const theme = getSessionTheme(type);
        const isActive = sessionType === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            disabled={isRunning}
            aria-pressed={isActive}
            className={[
              "min-h-11 touch-manipulation rounded-full border px-4 py-2 text-sm font-medium transition-[color,background-color,border-color,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50",
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
  );
});
