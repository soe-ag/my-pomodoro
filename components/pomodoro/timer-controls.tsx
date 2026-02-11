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
          className={`gap-2 bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-lg ring-1 ring-white/10 rounded-lg`}
        >
          <Play className="w-5 h-5" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className={`gap-2 cursor-pointer text-white border-white/20 bg-black/40 ring-1 ring-white/5 rounded-lg shadow-sm`}
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
        className={`gap-2 cursor-pointer text-white border-white/20 bg-black/40 ring-1 ring-white/5 rounded-lg shadow-sm`}
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>
    </div>
  );
}
