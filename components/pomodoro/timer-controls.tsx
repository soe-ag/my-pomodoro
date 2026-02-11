"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Start / Pause Button */}
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className="gap-2 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 cursor-pointer "
        >
          <Play className="w-5 h-5" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className="gap-2 cursor-pointer"
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
        className="gap-2 cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>
    </div>
  );
}
