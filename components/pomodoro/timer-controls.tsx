"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { SessionType } from "@/lib/pomodoro/constants";

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
  const gradientFor = (type: SessionType) => {
    switch (type) {
      case "work":
        return "from-blue-600 to-purple-600";
      case "break":
        return "from-emerald-500 to-green-600";
      case "long-break":
        return "from-blue-400 to-blue-400";
      default:
        return "from-blue-600 to-purple-600";
    }
  };
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Start / Pause Button */}
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className={`gap-2 bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-2xl ring-1 ring-white/20 rounded-full px-6 py-3 transform transition-transform hover:-translate-y-1 hover:scale-105 active:scale-95`}
        >
          <Play className="w-5 h-5" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className={`gap-2 cursor-pointer text-white border-white/20 bg-white/5 dark:bg-black/40 ring-1 ring-white/5 rounded-full shadow-sm transform transition hover:scale-105 hover:text-white dark:hover:text-white`}
        >
          <Pause className="w-5 h-5" />
          Pause
        </Button>
      )}

      {/* Reset Button */}
      <Button
        onClick={onReset}
        size="lg"
        variant="outline"
        className={`gap-2 cursor-pointer text-white border-white/20 bg-transparent dark:bg-black/30 ring-1 ring-white/5 rounded-full shadow-sm transform transition hover:bg-white/5 dark:hover:bg-white/8 hover:scale-105 hover:text-white dark:hover:text-white`}
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>
    </div>
  );
}
