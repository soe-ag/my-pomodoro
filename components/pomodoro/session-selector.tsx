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
    <div className="flex flex-wrap gap-2">
      {SESSION_TYPES.map((type) => {
        const theme = getSessionTheme(type);
        const isActive = sessionType === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
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
  );
});