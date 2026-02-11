"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
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

  const handleResetDefaults = () => {
    const defaults: PomodoroSettings = {
      workDuration: 20 * 60,
      breakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      soundEnabled: !!soundEnabled,
      notificationsEnabled: !!notificationsEnabled,
    };

    // Update UI fields
    setWorkMin(20);
    setBreakMin(5);
    setLongBreakMin(15);

    // Persist and notify
    if (saveSettingsAndNotify) {
      saveSettingsAndNotify(defaults);
    } else {
      saveSettings(defaults);
      try {
        window.dispatchEvent(
          new CustomEvent("pomodoro:settings-saved", { detail: defaults }),
        );
      } catch {}
    }

    onSave?.(defaults);
  };

  return (
    <Card className="w-full p-10 bg-card text-card-foreground shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Settings</h3>
        {/* <div className="text-sm text-gray-500">
          Configure durations & notifications
        </div> */}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Work (minutes)</label>
        <div className="flex items-center gap-2">
          <Button
            aria-label="decrease work"
            size="sm"
            onClick={() => setWorkMin((v) => Math.max(1, v - 1))}
            className={`w-7 h-7 rounded-full bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-sm flex items-center justify-center text-sm leading-none transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>

          <input
            type="number"
            min={1}
            value={workMin}
            onChange={(e) => setWorkMin(Number(e.target.value))}
            className="bg-transparent border border-white/10 text-white text-center w-12 h-8 rounded-md"
            aria-label="work minutes"
          />

          <Button
            aria-label="increase work"
            size="sm"
            onClick={() => setWorkMin((v) => v + 1)}
            className={`w-7 h-7 rounded-full bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-sm flex items-center justify-center text-sm leading-none transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <label className="text-sm">Short break (minutes)</label>
        <div className="flex items-center gap-2">
          <Button
            aria-label="decrease break"
            size="sm"
            onClick={() => setBreakMin((v) => Math.max(1, v - 1))}
            className={`w-7 h-7 rounded-full bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-sm flex items-center justify-center text-sm leading-none transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <input
            type="number"
            min={1}
            value={breakMin}
            onChange={(e) => setBreakMin(Number(e.target.value))}
            className="bg-transparent border border-white/10 text-white text-center w-10 h-8 rounded-md"
            aria-label="break minutes"
          />
          <Button
            aria-label="increase break"
            size="sm"
            onClick={() => setBreakMin((v) => v + 1)}
            className={`w-7 h-7 rounded-full bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-sm flex items-center justify-center text-sm leading-none transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <label className="text-sm">Long break (minutes)</label>
        <div className="flex items-center gap-2">
          <Button
            aria-label="decrease long break"
            size="sm"
            onClick={() => setLongBreakMin((v) => Math.max(1, v - 1))}
            className={`w-7 h-7 rounded-full bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-sm flex items-center justify-center text-sm leading-none transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <input
            type="number"
            min={1}
            value={longBreakMin}
            onChange={(e) => setLongBreakMin(Number(e.target.value))}
            className="bg-transparent border border-white/10 text-white text-center w-10 h-8 rounded-md"
            aria-label="long break minutes"
          />
          <Button
            aria-label="increase long break"
            size="sm"
            onClick={() => setLongBreakMin((v) => v + 1)}
            className={`w-7 h-7 rounded-full bg-linear-to-r ${gradientFor(sessionType)} text-white shadow-sm flex items-center justify-center text-sm leading-none transform transition hover:-translate-y-0.5 hover:scale-105`}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
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
      <div className=" flex gap-2 justify-center md:justify-end flex-wrap">
        <Button
          variant="outline"
          onClick={handleResetDefaults}
          className="  text-white border-white/20 rounded-full px-4 py-2 shadow-sm hover:bg-white/5 dark:hover:bg-white/8 hover:text-white dark:hover:text-white hover:scale-105"
        >
          Reset Defaults
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="text-white border-white/20 rounded-full px-4 py-2 shadow-sm hover:bg-white/5 dark:hover:bg-white/8 hover:text-white dark:hover:text-white hover:scale-105"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className={`bg-linear-to-r ${gradientFor(sessionType)} text-white rounded-full px-4 py-2 shadow-lg transform transition hover:-translate-y-0.5 hover:scale-105`}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

export default Settings;
