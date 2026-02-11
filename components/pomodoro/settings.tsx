"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadSettings, saveSettings } from "@/lib/pomodoro/storage";
import { PomodoroSettings } from "@/lib/pomodoro/constants";

interface SettingsProps {
  onClose?: () => void;
  onSave?: (settings: PomodoroSettings) => void;
}

export function Settings({ onClose, onSave }: SettingsProps) {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const s = loadSettings();
    setWorkMin(Math.round(s.workDuration / 60));
    setBreakMin(Math.round(s.breakDuration / 60));
    setLongBreakMin(Math.round(s.longBreakDuration / 60));
    setSoundEnabled(!!s.soundEnabled);
    setNotificationsEnabled(!!s.notificationsEnabled);
  }, []);

  const handleSave = () => {
    const settings: PomodoroSettings = {
      workDuration: Math.max(1, Math.round(workMin)) * 60,
      breakDuration: Math.max(1, Math.round(breakMin)) * 60,
      longBreakDuration: Math.max(1, Math.round(longBreakMin)) * 60,
      soundEnabled: !!soundEnabled,
      notificationsEnabled: !!notificationsEnabled,
    };

    saveSettings(settings);
    onSave?.(settings);
    onClose?.();
  };

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <div className="text-sm text-gray-500">
          Configure durations & notifications
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Work (minutes)</label>
        <input
          type="number"
          min={1}
          value={workMin}
          onChange={(e) => setWorkMin(Number(e.target.value))}
          className="input input-sm"
        />

        <label className="text-sm">Short break (minutes)</label>
        <input
          type="number"
          min={1}
          value={breakMin}
          onChange={(e) => setBreakMin(Number(e.target.value))}
          className="input input-sm"
        />

        <label className="text-sm">Long break (minutes)</label>
        <input
          type="number"
          min={1}
          value={longBreakMin}
          onChange={(e) => setLongBreakMin(Number(e.target.value))}
          className="input input-sm"
        />

        <label className="text-sm">Sound</label>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
        />

        <label className="text-sm">Desktop notifications</label>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.checked)}
        />
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Card>
  );
}

export default Settings;
