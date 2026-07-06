"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { SessionType } from "@/lib/pomodoro/constants";
import { getSessionTheme } from "@/lib/pomodoro/session-theme";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  sessionType: SessionType;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  sessionType,
}: TimerControlsProps) {
  const theme = getSessionTheme(sessionType);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className={`min-w-32 rounded-full bg-linear-to-r ${theme.buttonClassName} px-6 shadow-[0_18px_45px_rgba(15,23,42,0.25)] transition-transform hover:-translate-y-0.5`}
        >
          <Play className="size-4" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className="min-w-32 rounded-full border-white/15 bg-white/8 px-6 text-white backdrop-blur-sm hover:bg-white/12"
        >
          <Pause className="size-4" />
          Pause
        </Button>
      )}

      <Button
        onClick={onReset}
        size="lg"
        variant="outline"
        className="rounded-full border-white/15 bg-transparent px-6 text-white hover:bg-white/8"
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  );
}
