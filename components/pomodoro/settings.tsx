"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  loadSettings,
  saveSettings,
  saveSettingsAndNotify,
} from "@/lib/pomodoro/storage";
import { PomodoroSettings } from "@/lib/pomodoro/constants";
import { SessionType } from "@/lib/pomodoro/constants";

interface SettingsProps {
  onClose?: () => void;
  onSave?: (settings: PomodoroSettings) => void;
  sessionType?: SessionType;
}

export function Settings({ onClose, onSave, sessionType }: SettingsProps) {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const s = loadSettings();
    Promise.resolve().then(() => {
      setWorkMin(Math.round(s.workDuration / 60));
      setBreakMin(Math.round(s.breakDuration / 60));
      setLongBreakMin(Math.round(s.longBreakDuration / 60));
      setSoundEnabled(!!s.soundEnabled);
      setNotificationsEnabled(!!s.notificationsEnabled);
    });
  }, []);

  const gradientFor = (type: SessionType | undefined) => {
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

  const colorFor = (type: SessionType | undefined) => {
    switch (type) {
      case "work":
        return "#6366F1"; // indigo-500/600
      case "break":
        return "#10B981"; // emerald-500
      case "long-break":
        return "#60A5FA"; // light blue-400
      default:
        return "#6366F1";
    }
  };

  const handleSave = () => {
    const settings: PomodoroSettings = {
      workDuration: Math.max(1, Math.round(workMin)) * 60,
      breakDuration: Math.max(1, Math.round(breakMin)) * 60,
      longBreakDuration: Math.max(1, Math.round(longBreakMin)) * 60,
      soundEnabled: !!soundEnabled,
      notificationsEnabled: !!notificationsEnabled,
    };

    // Save and notify other components
    // Use helper that dispatches events
    if (saveSettingsAndNotify) {
      saveSettingsAndNotify(settings);
    } else {
      saveSettings(settings);
      try {
        window.dispatchEvent(
          new CustomEvent("pomodoro:settings-saved", { detail: settings }),
        );
      } catch {}
    }

    // Request notification permission when user enables it
    if (
      settings.notificationsEnabled &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      Notification.requestPermission().catch(() => {});
    }
    onSave?.(settings);
    onClose?.();
  };

  return (
    <Card className="p-4 bg-card text-card-foreground shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        {/* <div className="text-sm text-gray-500">
          Configure durations & notifications
        </div> */}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Work (minutes)</label>
        <div className="flex items-center gap-2">
          <button
            aria-label="decrease work"
            className={`px-2 py-1 rounded-md h-8 flex items-center justify-center bg-linear-to-r ${gradientFor(sessionType)} text-white`}
            onClick={() => setWorkMin((v) => Math.max(1, v - 1))}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            value={workMin}
            onChange={(e) => setWorkMin(Number(e.target.value))}
            className="bg-transparent border border-white/10 text-white text-center w-10 h-8 rounded-md"
            aria-label="work minutes"
          />
          <button
            aria-label="increase work"
            className={`px-2 py-1 rounded-md h-8 flex items-center justify-center bg-linear-to-r ${gradientFor(sessionType)} text-white`}
            onClick={() => setWorkMin((v) => v + 1)}
          >
            +
          </button>
        </div>

        <label className="text-sm">Short break (minutes)</label>
        <div className="flex items-center gap-2">
          <button
            aria-label="decrease break"
            className={`px-2 py-1 rounded-md h-8 flex items-center justify-center bg-linear-to-r ${gradientFor(sessionType)} text-white`}
            onClick={() => setBreakMin((v) => Math.max(1, v - 1))}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            value={breakMin}
            onChange={(e) => setBreakMin(Number(e.target.value))}
            className="bg-transparent border border-white/10 text-white text-center w-10 h-8 rounded-md"
            aria-label="break minutes"
          />
          <button
            aria-label="increase break"
            className={`px-2 py-1 rounded-md h-8 flex items-center justify-center bg-linear-to-r ${gradientFor(sessionType)} text-white`}
            onClick={() => setBreakMin((v) => v + 1)}
          >
            +
          </button>
        </div>

        <label className="text-sm">Long break (minutes)</label>
        <div className="flex items-center gap-2">
          <button
            aria-label="decrease long break"
            className={`px-2 py-1 rounded-md h-8 flex items-center justify-center bg-linear-to-r ${gradientFor(sessionType)} text-white`}
            onClick={() => setLongBreakMin((v) => Math.max(1, v - 1))}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            value={longBreakMin}
            onChange={(e) => setLongBreakMin(Number(e.target.value))}
            className="bg-transparent border border-white/10 text-white text-center w-10 h-8 rounded-md"
            aria-label="long break minutes"
          />
          <button
            aria-label="increase long break"
            className={`px-2 py-1 rounded-md h-8 flex items-center justify-center bg-linear-to-r ${gradientFor(sessionType)} text-white`}
            onClick={() => setLongBreakMin((v) => v + 1)}
          >
            +
          </button>
        </div>

        <label className="text-sm">Sound</label>
        <div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            style={{ accentColor: colorFor(sessionType) }}
          />
        </div>

        <label className="text-sm">Desktop notifications</label>
        <div>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            style={{ accentColor: colorFor(sessionType) }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="text-white border-white/20"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className={`bg-linear-to-r ${gradientFor(sessionType)} text-white`}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

export default Settings;
